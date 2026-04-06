from flask import Blueprint, request, jsonify
from models import db, Lead

leads_bp = Blueprint('leads_bp', __name__)

@leads_bp.route('/api/leads', methods=['GET'])
def get_leads():
    """Return all WhatsApp leads, optionally filtered by status."""
    status = request.args.get('status')
    query = Lead.query.order_by(Lead.id.asc())
    if status and status != 'All':
        query = query.filter_by(status=status)
    leads = query.all()
    return jsonify([l.to_dict() for l in leads])

@leads_bp.route('/api/leads', methods=['POST'])
def create_lead():
    """Create a new WhatsApp lead or Manual Lead."""
    from models import Pickup, Donor, Activity
    from datetime import datetime

    data = request.get_json()
    name = data['name'].strip()
    phone = data['phone'].strip()
    location = data['location'].strip()
    waste_type = data['wasteType']
    date = data['date']
    time = data['time']
    try: weight = float(str(data['weight']).replace('kg', '').strip())
    except: weight = 0.0
    status = data.get('status', 'Pending')

    now = datetime.utcnow()

    # 1. Handle Donor
    donor = Donor.query.filter_by(phone=phone).first()
    if not donor:
        donor = Donor(
            name=name,
            email=f"{phone}@no-email.com",
            phone=phone,
            location=location,
            join_date=now.strftime('%Y-%m-%d'),
            total_kg=0.0,
            pickups=0,
        )
        db.session.add(donor)
        db.session.commit()

    donor.total_kg += weight
    donor.pickups += 1
    if donor.total_kg > 150: donor.tier = 'champion'
    elif donor.total_kg > 50: donor.tier = 'guardian'
    elif donor.total_kg > 10: donor.tier = 'recycler'
    else: donor.tier = 'seedling'

    # 2. Handle Lead
    lead = Lead(
        name=name,
        location=location,
        phone=phone,
        waste_type=waste_type,
        date=date,
        time=time,
        weight=weight,
        preferred_time=data.get('preferredTime', f"{date} {time}".strip()),
        status=status,
    )
    db.session.add(lead)
    
    # 3. Handle Pickup
    pickup = Pickup(
        donor=name,
        location=location,
        phone=phone,
        waste_type=waste_type,
        date=date,
        time=time,
        weight=weight,
        preferred_time=data.get('preferredTime', f"{date} {time}".strip()),
        status=status,
        driver='Unassigned',
    )
    db.session.add(pickup)

    # 4. Handle Activity
    activity = Activity(
        donor=name,
        location=location,
        waste_type=waste_type,
        weight=f"{weight} kg",
        time='just now',
    )
    db.session.add(activity)
    
    db.session.commit()
    return jsonify(lead.to_dict()), 201

@leads_bp.route('/api/leads/<int:lead_id>', methods=['PUT'])
def update_lead_full(lead_id):
    """Full update of a lead record."""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()

    if 'name' in data: lead.name = data['name']
    if 'location' in data: lead.location = data['location']
    if 'phone' in data: lead.phone = data['phone']
    if 'wasteType' in data: lead.waste_type = data['wasteType']
    if 'date' in data: lead.date = data['date']
    if 'time' in data: lead.time = data['time']
    if 'weight' in data: lead.weight = data['weight']
    if 'preferredTime' in data: lead.preferred_time = data['preferredTime']
    if 'status' in data: lead.status = data['status']

    db.session.commit()
    return jsonify(lead.to_dict())

@leads_bp.route('/api/leads/<int:lead_id>', methods=['PATCH'])
def update_lead(lead_id):
    """Partial update a lead's fields."""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()

    if 'status' in data: lead.status = data['status']
    if 'name' in data: lead.name = data['name']
    if 'location' in data: lead.location = data['location']
    if 'phone' in data: lead.phone = data['phone']
    if 'wasteType' in data: lead.waste_type = data['wasteType']
    if 'date' in data: lead.date = data['date']
    if 'time' in data: lead.time = data['time']
    if 'weight' in data: lead.weight = data['weight']
    if 'preferredTime' in data: lead.preferred_time = data['preferredTime']

    db.session.commit()
    return jsonify(lead.to_dict())

@leads_bp.route('/api/leads/<int:lead_id>/status', methods=['PATCH'])
def update_lead_status(lead_id):
    """Quick status change for a single lead."""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()
    if 'status' not in data:
        return jsonify({'error': 'status field is required'}), 400
    lead.status = data['status']
    db.session.commit()
    return jsonify(lead.to_dict())

@leads_bp.route('/api/leads/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Delete a lead record and its corresponding pickup."""
    from models import Pickup
    lead = Lead.query.get_or_404(lead_id)
    
    # Also delete matching pickup(s) based on phone and date
    pickups = Pickup.query.filter_by(phone=lead.phone, date=lead.date).all()
    for p in pickups:
        db.session.delete(p)

    db.session.delete(lead)
    db.session.commit()
    return jsonify({'message': 'Lead deleted', 'id': lead_id})

@leads_bp.route('/api/leads/bulk-import', methods=['POST'])
def bulk_import_leads():
    """Bulk import leads from CSV/XLSX parsed on frontend."""
    from models import Pickup, Donor, Activity
    from datetime import datetime

    data = request.get_json()
    records = data.get('records', [])
    if not records:
        return jsonify({'error': 'No records provided'}), 400

    imported = []
    now = datetime.utcnow()
    
    for rec in records:
        name = rec.get('name', 'Unknown').strip()
        location = rec.get('location', '').strip()
        phone = rec.get('phone', 'No Phone').strip()
        waste_type = rec.get('wasteType', rec.get('waste_type', 'Other'))
        date = rec.get('date', '')
        time = rec.get('time', '')
        try:
            val = str(rec.get('weight', 0)).lower().replace('kg', '').strip()
            weight = float(val) if val else 0.0
        except:
            weight = 0.0
        status = rec.get('status', 'Pending')

        # 1. Handle Donor
        donor = Donor.query.filter_by(phone=phone).first()
        if not donor:
            donor = Donor(
                name=name,
                email=f"{phone}@no-email.com",
                phone=phone,
                location=location,
                join_date=now.strftime('%Y-%m-%d'),
                total_kg=0.0,
                pickups=0,
            )
            db.session.add(donor)
            db.session.commit() # commit early to ensure donor exists

        donor.total_kg += weight
        donor.pickups += 1
        # Update tier
        if donor.total_kg > 150: donor.tier = 'champion'
        elif donor.total_kg > 50: donor.tier = 'guardian'
        elif donor.total_kg > 10: donor.tier = 'recycler'
        else: donor.tier = 'seedling'

        # 2. Handle Lead
        lead = Lead(
            name=name,
            location=location,
            phone=phone,
            waste_type=waste_type,
            date=date,
            time=time,
            weight=weight,
            preferred_time=f"{date} {time}".strip(),
            status=status,
        )
        db.session.add(lead)

        # 3. Handle Pickup
        pickup = Pickup(
            donor=name,
            location=location,
            phone=phone,
            waste_type=waste_type,
            date=date,
            time=time,
            weight=weight,
            preferred_time=f"{date} {time}".strip(),
            status=status,
            driver='Unassigned',
        )
        db.session.add(pickup)

        # 4. Handle Activity
        activity = Activity(
            donor=name,
            location=location,
            waste_type=waste_type,
            weight=f"{weight} kg",
            time='Bulk imported',
        )
        db.session.add(activity)

        imported.append(lead)

    db.session.commit()
    return jsonify({
        'message': f'{len(imported)} records imported successfully',
        'count': len(imported),
        'records': [l.to_dict() for l in imported]
    }), 201
