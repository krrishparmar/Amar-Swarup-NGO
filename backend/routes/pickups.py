from flask import Blueprint, request, jsonify
from models import db, Pickup, Donor, Driver

pickups_bp = Blueprint('pickups_bp', __name__)


@pickups_bp.route('/api/pickups', methods=['GET'])
def get_pickups():
    """Return all pickups with stats."""
    status = request.args.get('status')
    query = Pickup.query.order_by(Pickup.id.desc())
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

    # Scheduled timings breakdown
    timing_breakdown = {}
    for p in all_pickups:
        t = p.preferred_time or 'Not specified'
        timing_breakdown[t] = timing_breakdown.get(t, 0) + 1

    return jsonify({
        'pickups': [p.to_dict() for p in pickups],
        'stats': stats,
        'timingBreakdown': timing_breakdown,
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
        preferred_time=data.get('preferredTime', ''),
        status=data.get('status', 'Pending'),
        driver=data.get('driver', 'Unassigned'),
        driver_id=data.get('driverId'),
    )
    db.session.add(pickup)

    # Auto update donor stats if they are a real donor
    donor = Donor.query.filter_by(phone=data['phone']).first()
    if donor:
        donor.total_kg += float(data['weight'])
        donor.pickups += 1

    db.session.commit()
    return jsonify(pickup.to_dict()), 201


@pickups_bp.route('/api/pickups/<int:pickup_id>', methods=['PUT'])
def update_pickup_full(pickup_id):
    """Full update of a pickup record."""
    pickup = Pickup.query.get_or_404(pickup_id)
    data = request.get_json()

    if 'donor' in data: pickup.donor = data['donor']
    if 'location' in data: pickup.location = data['location']
    if 'phone' in data: pickup.phone = data['phone']
    if 'wasteType' in data: pickup.waste_type = data['wasteType']
    if 'date' in data: pickup.date = data['date']
    if 'time' in data: pickup.time = data['time']
    if 'weight' in data: pickup.weight = data['weight']
    if 'preferredTime' in data: pickup.preferred_time = data['preferredTime']
    if 'status' in data: pickup.status = data['status']
    if 'driver' in data: pickup.driver = data['driver']
    if 'driverId' in data: pickup.driver_id = data['driverId']

    db.session.commit()
    return jsonify(pickup.to_dict())


@pickups_bp.route('/api/pickups/<int:pickup_id>', methods=['PATCH'])
def update_pickup(pickup_id):
    """Update a pickup's fields."""
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
    if 'preferredTime' in data: pickup.preferred_time = data['preferredTime']

    # Handle driver assignment
    if 'driverId' in data:
        driver_id = data['driverId']
        if driver_id:
            driver = Driver.query.get(driver_id)
            if driver:
                pickup.driver_id = driver.id
                pickup.driver = driver.name
        else:
            pickup.driver_id = None
            pickup.driver = 'Unassigned'

    db.session.commit()
    return jsonify(pickup.to_dict())


@pickups_bp.route('/api/pickups/<int:pickup_id>', methods=['DELETE'])
def delete_pickup(pickup_id):
    """Delete a pickup record."""
    pickup = Pickup.query.get_or_404(pickup_id)
    db.session.delete(pickup)
    db.session.commit()
    return jsonify({'message': 'Pickup deleted', 'id': pickup_id})
