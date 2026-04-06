from app import app, db
from models import Lead, Pickup, Donor, Activity
from datetime import datetime

with app.app_context():
    leads = Lead.query.all()
    count = 0
    now = datetime.utcnow()
    
    for lead in leads:
        # Check if pickup already exists for this lead
        exists = Pickup.query.filter_by(phone=lead.phone, donor=lead.name, waste_type=lead.waste_type).first()
        if exists:
            continue
            
        count += 1
        
        # 1. Handle Donor
        donor = Donor.query.filter_by(phone=lead.phone).first()
        if not donor:
            donor = Donor(
                name=lead.name,
                email=f"{lead.phone}@no-email.com",
                phone=lead.phone,
                location=lead.location,
                join_date=now.strftime('%Y-%m-%d'),
                total_kg=0.0,
                pickups=0,
            )
            db.session.add(donor)
            db.session.commit()
            
        donor.total_kg += lead.weight
        donor.pickups += 1
        
        if donor.total_kg > 150: donor.tier = 'champion'
        elif donor.total_kg > 50: donor.tier = 'guardian'
        elif donor.total_kg > 10: donor.tier = 'recycler'
        else: donor.tier = 'seedling'
        
        # 2. Handle Pickup
        pickup = Pickup(
            donor=lead.name,
            location=lead.location,
            phone=lead.phone,
            waste_type=lead.waste_type,
            date=lead.date,
            time=lead.time,
            weight=lead.weight,
            preferred_time=lead.preferred_time or f"{lead.date} {lead.time}".strip(),
            status=lead.status,
            driver='Unassigned',
        )
        pickup.created_at = lead.created_at
        db.session.add(pickup)
        
        # 3. Handle Activity
        activity = Activity(
            donor=lead.name,
            location=lead.location,
            waste_type=lead.waste_type,
            weight=f"{lead.weight} kg",
            time='Bulk imported',
            created_at=lead.created_at
        )
        db.session.add(activity)

    db.session.commit()
    print(f"Backfilled {count} missing records to Donors, Pickups, and Activities.")
