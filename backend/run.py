from config import app
from models import *
from flask_migrate import upgrade

if __name__ == "__main__":
    with app.app_context():
        upgrade()
    app.run()
