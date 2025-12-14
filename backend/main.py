import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import (
    db,
    SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS,
)
from models import Media

# =========================
# APP SETUP
# =========================

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS

db.init_app(app)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

with app.app_context():
    db.create_all()


# =========================
# HEALTH CHECK ROUTE
# =========================
@app.route("/")
def home():
    return {"message": "Backend is running"}

# =========================
# MEDIA CRUD ROUTES
# =========================

@app.route('/media', methods=['GET'])
def get_media():
    media_list = Media.query.all()
    json_media = [m.to_json() for m in media_list]
    return jsonify({"media": json_media})

@app.route("/create_media", methods=['POST'])
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
        poster_path=poster_path
    )

    try:
        db.session.add(new_media)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Media added successfully!"}), 201

@app.route("/update_media/<int:media_id>", methods=["PATCH"])
def update_media(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"message": "Media not found"}), 404

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
def delete_media(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"message": "Media not found"}), 404

    db.session.delete(media)
    db.session.commit()
    return jsonify({"message": "Media deleted successfully!"}), 200

# =========================
# TMDB ROUTES
# =========================

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
    with app.app_context():
        db.create_all()
    app.run(debug=True)
