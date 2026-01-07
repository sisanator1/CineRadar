from config import app, db
from models import *
import main  # This imports all  routes!

# Create tables when the module is imported 
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created/verified!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

# This only runs when you execute `python run.py` locally
if __name__ == "__main__":
    app.run(debug=True)