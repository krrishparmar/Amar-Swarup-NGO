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

@leads_bp.route('/api/leads/<int:lead_id>', methods=['PATCH'])
def update_lead(lead_id):
    """Update a lead's status."""
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
