from config import db

class Media(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)  # 'movie' or 'tv'
    status = db.Column(db.String(30), nullable=False)  # 'watching', 'completed', 'plan to watch'
    next_release_date = db.Column(db.String(50), nullable=True)

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "mediaType": self.media_type,
            "status": self.status,
            "nextReleaseDate": self.next_release_date,
        }
