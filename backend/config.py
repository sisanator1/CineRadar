import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# =========================
# CORS CONFIGURATION
# =========================
CORS(
    app,
    origins=[
        "https://sisanator1.github.io",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    expose_headers=["Content-Type"],
    max_age=3600
)

# =========================
# CORE CONFIG
# =========================
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "dev-secret-key-change-in-production"
)

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL or "sqlite:///media.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# =========================
# SESSION / AUTH COOKIES
# =========================
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=86400
)

# =========================
# EXTENSIONS
# =========================
db = SQLAlchemy()
db.init_app(app)

migrate = Migrate(app, db)

bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# 🚨 CRITICAL FIX: Stop redirects, return JSON instead
@login_manager.unauthorized_handler
def unauthorized():
    return {"error": "Unauthorized"}, 401

# =========================
# USER LOADER
# =========================
@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))
