"""Seed the database with the original mock data."""
from app import app
from models import db, Lead, Pickup, Donor, Activity, MonthlyReport, WasteBreakdown, TopArea


def seed():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # ── Leads ──────────────────────────────────
        leads_data = [
            {'name': 'Rajesh Deshmukh', 'location': 'Dharampeth', 'phone': '+91 98XXX XX234', 'waste_type': 'E-Waste', 'date': '2025-03-10', 'time': '10:00 AM', 'weight': 12.5, 'status': 'Confirmed'},
            {'name': 'Priya Wankhede', 'location': 'Sitabuldi', 'phone': '+91 90XXX XX891', 'waste_type': 'Plastic', 'date': '2025-03-10', 'time': '11:30 AM', 'weight': 8.2, 'status': 'Pending'},
            {'name': 'Amit Gajbhiye', 'location': 'Manewada', 'phone': '+91 77XXX XX456', 'waste_type': 'Paper', 'date': '2025-03-10', 'time': '02:00 PM', 'weight': 22.0, 'status': 'Completed'},
            {'name': 'Sneha Raut', 'location': 'Sadar', 'phone': '+91 88XXX XX321', 'waste_type': 'Metal', 'date': '2025-03-10', 'time': '03:30 PM', 'weight': 15.7, 'status': 'Confirmed'},
            {'name': 'Vikram Thakre', 'location': 'Civil Lines', 'phone': '+91 93XXX XX789', 'waste_type': 'E-Waste', 'date': '2025-03-10', 'time': '04:00 PM', 'weight': 5.3, 'status': 'Pending'},
            {'name': 'Anita Borkar', 'location': 'Ramdaspeth', 'phone': '+91 81XXX XX112', 'waste_type': 'Mixed', 'date': '2025-03-11', 'time': '09:00 AM', 'weight': 18.9, 'status': 'Pending'},
            {'name': 'Rahul Meshram', 'location': 'Wardhaman Nagar', 'phone': '+91 70XXX XX667', 'waste_type': 'Plastic', 'date': '2025-03-11', 'time': '10:30 AM', 'weight': 9.4, 'status': 'Cancelled'},
            {'name': 'Deepa Khandelwal', 'location': 'Laxmi Nagar', 'phone': '+91 85XXX XX543', 'waste_type': 'Paper', 'date': '2025-03-11', 'time': '01:00 PM', 'weight': 30.0, 'status': 'Completed'},
            {'name': 'Suresh Yadav', 'location': 'Trimurti Nagar', 'phone': '+91 96XXX XX876', 'waste_type': 'Metal', 'date': '2025-03-12', 'time': '11:00 AM', 'weight': 7.1, 'status': 'Confirmed'},
            {'name': 'Kavita Pande', 'location': 'Pratap Nagar', 'phone': '+91 73XXX XX998', 'waste_type': 'E-Waste', 'date': '2025-03-12', 'time': '12:30 PM', 'weight': 14.6, 'status': 'Pending'},
            {'name': 'Nikhil Dongre', 'location': 'Bajaj Nagar', 'phone': '+91 82XXX XX145', 'waste_type': 'Mixed', 'date': '2025-03-12', 'time': '03:00 PM', 'weight': 25.3, 'status': 'Completed'},
            {'name': 'Meena Wasnik', 'location': 'Hingna', 'phone': '+91 91XXX XX332', 'waste_type': 'Plastic', 'date': '2025-03-13', 'time': '09:30 AM', 'weight': 11.8, 'status': 'Pending'},
        ]
        for data in leads_data:
            db.session.add(Lead(**data))

        # ── Pickups ────────────────────────────────
        pickups_data = [
            {'donor': 'Rajesh Deshmukh', 'location': 'Dharampeth', 'phone': '+91 98XXX XX234', 'waste_type': 'E-Waste', 'date': '2025-03-10', 'time': '10:00 AM', 'weight': 12.5, 'status': 'Confirmed', 'driver': 'Sunil K.'},
            {'donor': 'Priya Wankhede', 'location': 'Sitabuldi', 'phone': '+91 90XXX XX891', 'waste_type': 'Plastic', 'date': '2025-03-10', 'time': '11:30 AM', 'weight': 8.2, 'status': 'In Transit', 'driver': 'Rahul P.'},
            {'donor': 'Amit Gajbhiye', 'location': 'Manewada', 'phone': '+91 77XXX XX456', 'waste_type': 'Paper', 'date': '2025-03-10', 'time': '02:00 PM', 'weight': 22.0, 'status': 'Completed', 'driver': 'Vinay M.'},
            {'donor': 'Sneha Raut', 'location': 'Sadar', 'phone': '+91 88XXX XX321', 'waste_type': 'Metal', 'date': '2025-03-10', 'time': '03:30 PM', 'weight': 15.7, 'status': 'Confirmed', 'driver': 'Amit D.'},
            {'donor': 'Vikram Thakre', 'location': 'Civil Lines', 'phone': '+91 93XXX XX789', 'waste_type': 'E-Waste', 'date': '2025-03-10', 'time': '04:00 PM', 'weight': 5.3, 'status': 'Pending', 'driver': 'Unassigned'},
            {'donor': 'Anita Borkar', 'location': 'Ramdaspeth', 'phone': '+91 81XXX XX112', 'waste_type': 'Mixed', 'date': '2025-03-11', 'time': '09:00 AM', 'weight': 18.9, 'status': 'Scheduled', 'driver': 'Sunil K.'},
            {'donor': 'Rahul Meshram', 'location': 'Wardhaman Nagar', 'phone': '+91 70XXX XX667', 'waste_type': 'Plastic', 'date': '2025-03-11', 'time': '10:30 AM', 'weight': 9.4, 'status': 'Cancelled', 'driver': '—'},
            {'donor': 'Deepa Khandelwal', 'location': 'Laxmi Nagar', 'phone': '+91 85XXX XX543', 'waste_type': 'Paper', 'date': '2025-03-11', 'time': '01:00 PM', 'weight': 30.0, 'status': 'Completed', 'driver': 'Vinay M.'},
            {'donor': 'Suresh Yadav', 'location': 'Trimurti Nagar', 'phone': '+91 96XXX XX876', 'waste_type': 'Metal', 'date': '2025-03-12', 'time': '11:00 AM', 'weight': 7.1, 'status': 'Scheduled', 'driver': 'Rahul P.'},
            {'donor': 'Kavita Pande', 'location': 'Pratap Nagar', 'phone': '+91 73XXX XX998', 'waste_type': 'E-Waste', 'date': '2025-03-12', 'time': '12:30 PM', 'weight': 14.6, 'status': 'Pending', 'driver': 'Unassigned'},
            {'donor': 'Nikhil Dongre', 'location': 'Bajaj Nagar', 'phone': '+91 82XXX XX145', 'waste_type': 'Mixed', 'date': '2025-03-12', 'time': '03:00 PM', 'weight': 25.3, 'status': 'Completed', 'driver': 'Amit D.'},
            {'donor': 'Meena Wasnik', 'location': 'Hingna', 'phone': '+91 91XXX XX332', 'waste_type': 'Plastic', 'date': '2025-03-13', 'time': '09:30 AM', 'weight': 11.8, 'status': 'Pending', 'driver': 'Unassigned'},
        ]
        for data in pickups_data:
            db.session.add(Pickup(**data))

        # ── Donors ─────────────────────────────────
        donors_data = [
            {'name': 'Rajesh Deshmukh', 'email': 'rajesh.d@email.com', 'phone': '+91 98XXX XX234', 'location': 'Dharampeth', 'join_date': '2024-06-15', 'total_kg': 185.4, 'pickups': 24, 'tier': 'champion'},
            {'name': 'Deepa Khandelwal', 'email': 'deepa.k@email.com', 'phone': '+91 85XXX XX543', 'location': 'Laxmi Nagar', 'join_date': '2024-07-02', 'total_kg': 162.0, 'pickups': 19, 'tier': 'champion'},
            {'name': 'Nikhil Dongre', 'email': 'nikhil.d@email.com', 'phone': '+91 82XXX XX145', 'location': 'Bajaj Nagar', 'join_date': '2024-05-20', 'total_kg': 148.7, 'pickups': 22, 'tier': 'guardian'},
            {'name': 'Anita Borkar', 'email': 'anita.b@email.com', 'phone': '+91 81XXX XX112', 'location': 'Ramdaspeth', 'join_date': '2024-08-10', 'total_kg': 124.3, 'pickups': 17, 'tier': 'guardian'},
            {'name': 'Sneha Raut', 'email': 'sneha.r@email.com', 'phone': '+91 88XXX XX321', 'location': 'Sadar', 'join_date': '2024-09-01', 'total_kg': 98.5, 'pickups': 14, 'tier': 'guardian'},
            {'name': 'Amit Gajbhiye', 'email': 'amit.g@email.com', 'phone': '+91 77XXX XX456', 'location': 'Manewada', 'join_date': '2024-10-18', 'total_kg': 76.2, 'pickups': 11, 'tier': 'guardian'},
            {'name': 'Suresh Yadav', 'email': 'suresh.y@email.com', 'phone': '+91 96XXX XX876', 'location': 'Trimurti Nagar', 'join_date': '2024-11-05', 'total_kg': 45.8, 'pickups': 8, 'tier': 'recycler'},
            {'name': 'Priya Wankhede', 'email': 'priya.w@email.com', 'phone': '+91 90XXX XX891', 'location': 'Sitabuldi', 'join_date': '2024-12-12', 'total_kg': 38.1, 'pickups': 6, 'tier': 'recycler'},
            {'name': 'Kavita Pande', 'email': 'kavita.p@email.com', 'phone': '+91 73XXX XX998', 'location': 'Pratap Nagar', 'join_date': '2025-01-08', 'total_kg': 22.9, 'pickups': 4, 'tier': 'recycler'},
            {'name': 'Vikram Thakre', 'email': 'vikram.t@email.com', 'phone': '+91 93XXX XX789', 'location': 'Civil Lines', 'join_date': '2025-02-14', 'total_kg': 8.4, 'pickups': 2, 'tier': 'seedling'},
            {'name': 'Meena Wasnik', 'email': 'meena.w@email.com', 'phone': '+91 91XXX XX332', 'location': 'Hingna', 'join_date': '2025-02-20', 'total_kg': 11.8, 'pickups': 3, 'tier': 'recycler'},
            {'name': 'Rahul Meshram', 'email': 'rahul.m@email.com', 'phone': '+91 70XXX XX667', 'location': 'Wardhaman Nagar', 'join_date': '2025-03-01', 'total_kg': 9.4, 'pickups': 2, 'tier': 'seedling'},
        ]
        for data in donors_data:
            db.session.add(Donor(**data))

        # ── Activity Feed ──────────────────────────
        activities_data = [
            {'donor': 'Rajesh Deshmukh', 'location': 'Dharampeth', 'waste_type': 'E-Waste', 'time': '2 mins ago', 'weight': '12.5 kg'},
            {'donor': 'Priya Wankhede', 'location': 'Sitabuldi', 'waste_type': 'Plastic', 'time': '8 mins ago', 'weight': '8.2 kg'},
            {'donor': 'Amit Gajbhiye', 'location': 'Manewada', 'waste_type': 'Paper', 'time': '15 mins ago', 'weight': '22 kg'},
            {'donor': 'Sneha Raut', 'location': 'Sadar', 'waste_type': 'Metal', 'time': '23 mins ago', 'weight': '15.7 kg'},
            {'donor': 'Vikram Thakre', 'location': 'Civil Lines', 'waste_type': 'E-Waste', 'time': '31 mins ago', 'weight': '5.3 kg'},
            {'donor': 'Anita Borkar', 'location': 'Ramdaspeth', 'waste_type': 'Mixed', 'time': '45 mins ago', 'weight': '18.9 kg'},
            {'donor': 'Rahul Meshram', 'location': 'Wardhaman Nagar', 'waste_type': 'Plastic', 'time': '1 hr ago', 'weight': '9.4 kg'},
            {'donor': 'Deepa Khandelwal', 'location': 'Laxmi Nagar', 'waste_type': 'Paper', 'time': '1.5 hrs ago', 'weight': '30 kg'},
            {'donor': 'Suresh Yadav', 'location': 'Trimurti Nagar', 'waste_type': 'Metal', 'time': '2 hrs ago', 'weight': '7.1 kg'},
            {'donor': 'Meena Wasnik', 'location': 'Hingna', 'waste_type': 'Plastic', 'time': '3 hrs ago', 'weight': '11.8 kg'},
        ]
        for data in activities_data:
            db.session.add(Activity(**data))

        # ── Monthly Reports ────────────────────────
        monthly_data = [
            {'month': 'Oct 2024', 'waste': 1850, 'pickups': 78, 'donors': 42},
            {'month': 'Nov 2024', 'waste': 2340, 'pickups': 96, 'donors': 55},
            {'month': 'Dec 2024', 'waste': 2100, 'pickups': 88, 'donors': 48},
            {'month': 'Jan 2025', 'waste': 2780, 'pickups': 112, 'donors': 63},
            {'month': 'Feb 2025', 'waste': 3200, 'pickups': 134, 'donors': 71},
            {'month': 'Mar 2025', 'waste': 3550, 'pickups': 148, 'donors': 82},
        ]
        for data in monthly_data:
            db.session.add(MonthlyReport(**data))

        # ── Waste Breakdown ────────────────────────
        waste_data = [
            {'type': 'E-Waste', 'kg': 6420, 'percent': 25.8, 'color': '#f59e0b'},
            {'type': 'Plastic', 'kg': 7850, 'percent': 31.6, 'color': '#3b82f6'},
            {'type': 'Paper', 'kg': 4320, 'percent': 17.4, 'color': '#a78bfa'},
            {'type': 'Metal', 'kg': 3180, 'percent': 12.8, 'color': '#6b7280'},
            {'type': 'Mixed', 'kg': 3080, 'percent': 12.4, 'color': '#0d9488'},
        ]
        for data in waste_data:
            db.session.add(WasteBreakdown(**data))

        # ── Top Areas ──────────────────────────────
        areas_data = [
            {'area': 'Dharampeth', 'pickups': 34, 'kg': 420.5},
            {'area': 'Sitabuldi', 'pickups': 28, 'kg': 352.1},
            {'area': 'Ramdaspeth', 'pickups': 25, 'kg': 310.8},
            {'area': 'Civil Lines', 'pickups': 22, 'kg': 278.4},
            {'area': 'Sadar', 'pickups': 19, 'kg': 245.2},
        ]
        for data in areas_data:
            db.session.add(TopArea(**data))

        db.session.commit()
        print('✅ Database seeded successfully!')
        print(f'   Leads: {Lead.query.count()}')
        print(f'   Pickups: {Pickup.query.count()}')
        print(f'   Donors: {Donor.query.count()}')
        print(f'   Activities: {Activity.query.count()}')
        print(f'   Monthly Reports: {MonthlyReport.query.count()}')
        print(f'   Waste Breakdown: {WasteBreakdown.query.count()}')
        print(f'   Top Areas: {TopArea.query.count()}')


if __name__ == '__main__':
    seed()
