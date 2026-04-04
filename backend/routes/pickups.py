from flask import Blueprint, request, jsonify
from models import db, Pickup, Donor

pickups_bp = Blueprint('pickups_bp', __name__)

@pickups_bp.route('/api/pickups', methods=['GET'])
def get_pickups():
    """Return all pickups with stats."""
    status = request.args.get('status')
    query = Pickup.query.order_by(Pickup.id.asc())
    if status and status != 'All':
        query = query.filter_by(status=status)
    pickups = query.all()

    # Compute stats
    all_pickups = Pickup.query.all()
    stats = [
        {'label': "Today's Pickups", 'value': len(all_pickups), 'icon': '📅'},
        {'label': 'In Transit', 'value': sum(1 for p in all_pickups if p.status == 'In Transit'), 'icon': '🚛'},
        {'label': 'Completed Today', 'value': sum(1 for p in all_pickups if p.status == 'Completed'), 'icon': '✅'},
        {'label': 'Pending Assignment', 'value': sum(1 for p in all_pickups if p.status == 'Pending'), 'icon': '⏳'},
    ]

    return jsonify({
        'pickups': [p.to_dict() for p in pickups],
        'stats': stats,
    })

@pickups_bp.route('/api/pickups', methods=['POST'])
def create_pickup():
    """Create a new pickup."""
    data = request.get_json()
    pickup = Pickup(
        donor=data['donor'],
        location=data['location'],
        phone=data['phone'],
        waste_type=data['wasteType'],
        date=data['date'],
        time=data['time'],
        weight=data['weight'],
        status=data.get('status', 'Pending'),
        driver=data.get('driver', 'Unassigned'),
    )
    db.session.add(pickup)
    
    # Auto update donor stats if they are a real donor
    donor = Donor.query.filter_by(phone=data['phone']).first()
    if donor:
        donor.total_kg += float(data['weight'])
        donor.pickups += 1

    db.session.commit()
    return jsonify(pickup.to_dict()), 201

@pickups_bp.route('/api/pickups/<int:pickup_id>', methods=['PATCH'])
def update_pickup(pickup_id):
    """Update a pickup's status or driver."""
    pickup = Pickup.query.get_or_404(pickup_id)
    data = request.get_json()
    
    if 'status' in data: pickup.status = data['status']
    if 'driver' in data: pickup.driver = data['driver']
    if 'donor' in data: pickup.donor = data['donor']
    if 'location' in data: pickup.location = data['location']
    if 'phone' in data: pickup.phone = data['phone']
    if 'wasteType' in data: pickup.waste_type = data['wasteType']
    if 'date' in data: pickup.date = data['date']
    if 'time' in data: pickup.time = data['time']
    if 'weight' in data: pickup.weight = data['weight']

    # Handle completion logic for stats can be added here if needed
    db.session.commit()
    return jsonify(pickup.to_dict())
