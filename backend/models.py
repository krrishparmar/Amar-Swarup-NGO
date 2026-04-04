from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Lead(db.Model):
    __tablename__ = 'leads'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    waste_type = db.Column(db.String(30), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'phone': self.phone,
            'wasteType': self.waste_type,
            'date': self.date,
            'time': self.time,
            'weight': self.weight,
            'status': self.status,
        }


class Pickup(db.Model):
    __tablename__ = 'pickups'

    id = db.Column(db.Integer, primary_key=True)
    donor = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    waste_type = db.Column(db.String(30), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    driver = db.Column(db.String(60), nullable=False, default='Unassigned')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'donor': self.donor,
            'location': self.location,
            'phone': self.phone,
            'wasteType': self.waste_type,
            'date': self.date,
            'time': self.time,
            'weight': self.weight,
            'status': self.status,
            'driver': self.driver,
        }


class Donor(db.Model):
    __tablename__ = 'donors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    join_date = db.Column(db.String(20), nullable=False)
    total_kg = db.Column(db.Float, nullable=False, default=0.0)
    pickups = db.Column(db.Integer, nullable=False, default=0)
    tier = db.Column(db.String(20), nullable=False, default='seedling')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'location': self.location,
            'joinDate': self.join_date,
            'totalKg': self.total_kg,
            'pickups': self.pickups,
            'tier': self.tier,
        }

    def to_leaderboard_dict(self, rank):
        return {
            'rank': rank,
            'name': self.name,
            'city': 'Nagpur',
            'totalKg': self.total_kg,
            'points': int(self.total_kg * 10),
            'tier': self.tier,
        }


class Activity(db.Model):
    __tablename__ = 'activities'

    id = db.Column(db.Integer, primary_key=True)
    donor = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    waste_type = db.Column(db.String(30), nullable=False)
    weight = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'donor': self.donor,
            'location': self.location,
            'wasteType': self.waste_type,
            'weight': self.weight,
            'time': self.time,
        }


class MonthlyReport(db.Model):
    __tablename__ = 'monthly_reports'

    id = db.Column(db.Integer, primary_key=True)
    month = db.Column(db.String(20), nullable=False)
    waste = db.Column(db.Integer, nullable=False, default=0)
    pickups = db.Column(db.Integer, nullable=False, default=0)
    donors = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            'month': self.month,
            'waste': self.waste,
            'pickups': self.pickups,
            'donors': self.donors,
        }


class WasteBreakdown(db.Model):
    __tablename__ = 'waste_breakdown'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)
    kg = db.Column(db.Integer, nullable=False, default=0)
    percent = db.Column(db.Float, nullable=False, default=0.0)
    color = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            'type': self.type,
            'kg': self.kg,
            'percent': self.percent,
            'color': self.color,
        }


class TopArea(db.Model):
    __tablename__ = 'top_areas'

    id = db.Column(db.Integer, primary_key=True)
    area = db.Column(db.String(60), nullable=False)
    pickups = db.Column(db.Integer, nullable=False, default=0)
    kg = db.Column(db.Float, nullable=False, default=0.0)

    def to_dict(self):
        return {
            'area': self.area,
            'pickups': self.pickups,
            'kg': self.kg,
        }
