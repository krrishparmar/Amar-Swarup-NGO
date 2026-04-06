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
    """Create a new WhatsApp lead."""
    data = request.get_json()
    lead = Lead(
        name=data['name'],
        location=data['location'],
        phone=data['phone'],
        waste_type=data['wasteType'],
        date=data['date'],
        time=data['time'],
        weight=data['weight'],
        status=data.get('status', 'Pending'),
    )
    db.session.add(lead)
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
    data = request.get_json()
    records = data.get('records', [])
    if not records:
        return jsonify({'error': 'No records provided'}), 400

    imported = []
    for rec in records:
        lead = Lead(
            name=rec.get('name', 'Unknown'),
            location=rec.get('location', ''),
            phone=rec.get('phone', ''),
            waste_type=rec.get('wasteType', rec.get('waste_type', 'Other')),
            date=rec.get('date', ''),
            time=rec.get('time', ''),
            weight=float(rec.get('weight', 0)),
            status=rec.get('status', 'Pending'),
        )
        db.session.add(lead)
        imported.append(lead)

    db.session.commit()
    return jsonify({
        'message': f'{len(imported)} records imported successfully',
        'count': len(imported),
        'records': [l.to_dict() for l in imported]
    }), 201
