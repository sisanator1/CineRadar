import os
import requests
from flask import request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from dotenv import load_dotenv
import re

from config import app, db, bcrypt
from models import Media, User

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


# APP SETUP


load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")






# HELPER FUNCTIONS


def validate_email(email):
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password must be at least 8 characters"""
    return len(password) >= 8


# HEALTH CHECK ROUTE

@app.route("/")
def home():
    return {"message": "Backend is running"}


# AUTH ROUTES


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    # Validation
    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400
    
    if len(username) < 3:
        return jsonify({"message": "Username must be at least 3 characters"}), 400
    
    if not validate_email(email):
        return jsonify({"message": "Invalid email format"}), 400
    
    if not validate_password(password):
        return jsonify({"message": "Password must be at least 8 characters"}), 400
    
    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400
    
    # Create new user
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({
            "message": "Account created successfully!",
            "user": new_user.to_json()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating account: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username_or_email = data.get('username', '').strip().lower()
    password = data.get('password', '')
    
    if not username_or_email or not password:
        return jsonify({"message": "Username/email and password required"}), 400
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    login_user(user)
    return jsonify({
        "message": "Login successful!",
        "user": user.to_json()
    }), 200

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/check_auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": current_user.to_json()
        }), 200
    return jsonify({"authenticated": False}), 200


# MEDIA CRUD ROUTES (Now Protected)


@app.route('/media', methods=['GET'])
@login_required
def get_media():
    # Only return media for the current user
    media_list = Media.query.filter_by(user_id=current_user.id).all()
    json_media = [m.to_json() for m in media_list]
    return jsonify({"media": json_media})

@app.route("/create_media", methods=['POST'])
@login_required
def create_media():
    data = request.json
    title = data.get('title')
    media_type = data.get('mediaType')
    status = data.get('status')
    next_release_date = data.get('nextReleaseDate')
    tmdb_id = data.get("tmdb_id")
    tmdb_type = data.get("tmdb_type")
    poster_path = data.get("poster_path")

    if not title or not media_type or not status:
        return jsonify({"message": "You must include a title, type, and status"}), 400

    new_media = Media(
        title=title,
        media_type=media_type,
        status=status,
        next_release_date=next_release_date,
        tmdb_id=tmdb_id,
        tmdb_type=tmdb_type,
        poster_path=poster_path,
        user_id=current_user.id  # NEW: Link to current user
    )

    try:
        db.session.add(new_media)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Media added successfully!"}), 201

@app.route("/update_media/<int:media_id>", methods=["PATCH"])
@login_required
def update_media(media_id):
    # Only allow updating user's own media
    media = Media.query.filter_by(id=media_id, user_id=current_user.id).first()
    if not media:
        return jsonify({"message": "Media not found or unauthorized"}), 404

    data = request.json
    media.title = data.get('title', media.title)
    media.media_type = data.get('mediaType', media.media_type)
    media.status = data.get('status', media.status)
    media.next_release_date = data.get('nextReleaseDate', media.next_release_date)
    media.tmdb_id = data.get("tmdb_id", media.tmdb_id)
    media.tmdb_type = data.get("tmdb_type", media.tmdb_type)
    media.poster_path = data.get("poster_path", media.poster_path)

    db.session.commit()
    return jsonify({"message": "Media updated successfully!"}), 200

@app.route("/delete_media/<int:media_id>", methods=["DELETE"])
@login_required
def delete_media(media_id):
    # Only allow deleting user's own media
    media = Media.query.filter_by(id=media_id, user_id=current_user.id).first()
    if not media:
        return jsonify({"message": "Media not found or unauthorized"}), 404

    db.session.delete(media)
    db.session.commit()
    return jsonify({"message": "Media deleted successfully!"}), 200


# TMDB ROUTES (Public - No auth needed)


@app.route("/tmdb_search/<string:media_type>", methods=["GET"])
def search_tmdb(media_type):
    query = request.args.get('query', '')

    if not query:
        return jsonify({"results": []}), 200

    if media_type == "movie":
        url = "https://api.themoviedb.org/3/search/movie"
    else:
        url = "https://api.themoviedb.org/3/search/tv"

    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "en-US"
    }

    response = requests.get(url, params=params)
    return jsonify(response.json()), response.status_code

@app.route("/tmdb/<string:media_type>/<int:tmdb_id>", methods=["GET"])
def get_tmdb_details(media_type, tmdb_id):
    if media_type == "movie":
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    else:
        url = f"https://api.themoviedb.org/3/tv/{tmdb_id}"

    params = {"api_key": TMDB_API_KEY, "language": "en-US"}
    response = requests.get(url, params=params)
    return jsonify(response.json()), response.status_code

@app.route("/tmdb_credits/<int:tmdb_id>/<string:media_type>", methods=["GET"])
def get_tmdb_credits(tmdb_id, media_type):
    if media_type == "movie":
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}/credits?api_key={TMDB_API_KEY}"
    else:
        url = f"https://api.themoviedb.org/3/tv/{tmdb_id}/credits?api_key={TMDB_API_KEY}"

    response = requests.get(url)
    return jsonify(response.json()), response.status_code

# =========================
# RUN APP LOCALLY
# =========================
if __name__ == "__main__":
    app.run(debug=True)