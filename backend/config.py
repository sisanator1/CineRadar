import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

# --------------------
# Flask app
# --------------------
app = Flask(__name__)

# --------------------
# CORS (required for auth cookies)
# --------------------
CORS(
    app,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# --------------------
# Security
# --------------------
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

# --------------------
# Database
# --------------------
DATABASE_URL = os.getenv("DATABASE_URL")

# Render compatibility
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL or "sqlite:///media.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --------------------
# Session cookies (production safe)
# --------------------
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["PERMANENT_SESSION_LIFETIME"] = 86400

# --------------------
# Extensions (FACTORY STYLE — IMPORTANT)
# --------------------
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)

migrate = Migrate(app, db)

login_manager.login_view = "login"

# --------------------
# User loader
# --------------------
@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))
