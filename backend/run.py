from config import app, db
from models import *
import main  # ✅ This imports all your routes!
from flask_migrate import upgrade

if __name__ == "__main__":
    with app.app_context():
        upgrade()
    app.run()