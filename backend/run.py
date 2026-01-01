from config import app, db
from models import *
import main  

if __name__ == "__main__":
    with app.app_context():
        try:
            # Create all tables if they don't exist
            db.create_all()
            print("✅ Database tables created/verified!")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
    app.run()