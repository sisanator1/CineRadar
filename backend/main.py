import os
import requests
from flask import request, jsonify
from config import app, db
from models import Media
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

# =========================
# MEDIA CRUD ROUTES
# =========================

# GET all media entries
@app.route('/media', methods=['GET'])
def get_media():
    media_list = Media.query.all()
    json_media = [m.to_json() for m in media_list]
    return jsonify({"media": json_media})

# CREATE a new media entry
@app.route("/create_media", methods=['POST'])
def create_media():
    data = request.json
    title = data.get('title')
    media_type = data.get('mediaType')
    status = data.get('status')
    next_release_date = data.get('nextReleaseDate')

    # NEW
    tmdb_id = data.get("tmdb_id")
    tmdb_type = data.get("tmdb_type")

    if not title or not media_type or not status:
        return jsonify({"message": "You must include a title, type, and status"}), 400

    new_media = Media(
        title=title,
        media_type=media_type,
        status=status,
        next_release_date=next_release_date,
        tmdb_id=tmdb_id,
        tmdb_type=tmdb_type
    )

    try:
        db.session.add(new_media)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Media added successfully!"}), 201


# UPDATE existing media entry
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

    # NEW
    media.tmdb_id = data.get("tmdb_id", media.tmdb_id)
    media.tmdb_type = data.get("tmdb_type", media.tmdb_type)

    db.session.commit()
    return jsonify({"message": "Media updated successfully!"}), 200


# DELETE a media entry
@app.route("/delete_media/<int:media_id>", methods=["DELETE"])
def delete_media(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"message": "Media not found"}), 404

    db.session.delete(media)
    db.session.commit()
    return jsonify({"message": "Media deleted successfully!"}), 200

# =========================
# TMDb ROUTES
# =========================

# Fetch TMDb movie details by TMDb ID
@app.route("/tmdb/<int:tmdb_id>", methods=["GET"])
def get_tmdb_details(tmdb_id):
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {"api_key": TMDB_API_KEY, "language": "en-US"}
    response = requests.get(url, params=params)

    if response.status_code != 200:
        return jsonify({"message": "Failed to fetch data from TMDb"}), response.status_code

    return jsonify(response.json())

# Test search route by movie title
@app.route("/test_tmdb/<string:title>", methods=["GET"])
def test_tmdb(title):
    url = f"https://api.themoviedb.org/3/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": title}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        return jsonify({"results": data.get("results", [])}), 200
    else:
        return jsonify({"error": "Failed to fetch from TMDb"}), response.status_code

# =========================
# RUN FLASK APP
# =========================
if __name__ == "__main__":
    print("==> Reached main block")

    with app.app_context():
        db.create_all()

    print("==> Starting Flask app...")
    app.run(debug=True)
@app.route("/tmdb_credits/<int:tmdb_id>/<string:media_type>", methods=["GET"])
def get_tmdb_credits(tmdb_id, media_type):
    if media_type == "movie":
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}/credits?api_key={TMDB_API_KEY}"
    else:
        url = f"https://api.themoviedb.org/3/tv/{tmdb_id}/credits?api_key={TMDB_API_KEY}"

    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Failed to fetch cast"}), response.status_code
