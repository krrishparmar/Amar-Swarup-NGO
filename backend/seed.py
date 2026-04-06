"""Seed the database — creates tables only, no mock data.
Run: python seed.py
"""
from app import app
from models import db


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print('✅ Database tables created (no mock data seeded).')
        print('   All tables are empty — data will come from real WhatsApp interactions and admin entries.')


if __name__ == '__main__':
    seed()
