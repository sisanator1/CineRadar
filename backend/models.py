from config import db
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to media
    media_items = db.relationship('Media', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Media(db.Model):
    __tablename__ = 'media'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    next_release_date = db.Column(db.String(50), nullable=True)
    tmdb_id = db.Column(db.Integer, nullable=True)
    tmdb_type = db.Column(db.String(10), nullable=True)
    poster_path = db.Column(db.String(200), nullable=True)
    
    # NEW: Foreign key to user
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "mediaType": self.media_type,
            "status": self.status,
            "nextReleaseDate": self.next_release_date,
            "tmdb_id": self.tmdb_id,
            "tmdb_type": self.tmdb_type,
            "poster_path": self.poster_path,
            "user_id": self.user_id
        }