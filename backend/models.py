from config import db

class Media(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    next_release_date = db.Column(db.String(50), nullable=True)
    tmdb_id = db.Column(db.Integer, nullable=True)
    tmdb_type = db.Column(db.String(10), nullable=True)
    poster_path = db.Column(db.String(200), nullable=True)  # NEW FIELD

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "mediaType": self.media_type,
            "status": self.status,
            "nextReleaseDate": self.next_release_date,
            "tmdb_id": self.tmdb_id,
            "tmdb_type": self.tmdb_type,
            "poster_path": self.poster_path  # NEW FIELD
        }