import re
from flask import Blueprint, request, jsonify
from models import db, Driver, Pickup

drivers_bp = Blueprint('drivers_bp', __name__)


# ── Driver Google Auth ──────────────────────────────────

import os as _os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = _os.environ.get(
    'GOOGLE_CLIENT_ID',
    '159199212470-dopq7jgrd42jh95im7ngh6ntt4hddq8e.apps.googleusercontent.com'
)

@drivers_bp.route('/api/drivers/google', methods=['POST'])
def driver_google_auth():
    """Authenticate a driver using Google OAuth."""
    data = request.get_json()
    token = data.get('credential')

    if not token:
        return jsonify({'error': 'No credential provided'}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo.get('email').lower()
        name = idinfo.get('name')

        driver = Driver.query.filter_by(email=email).first()
        if not driver:
            # Auto-register driver if not exists
            driver = Driver(
                name=name,
                email=email,
                phone='Google Auth', # placeholder
                password_hash='',
                vehicle_number='',
                status='Active'
            )
            db.session.add(driver)
            db.session.commit()

        return jsonify({'success': True, 'driver': driver.to_dict()})
    except ValueError as e:
        return jsonify({'error': f'Invalid token: {str(e)}'}), 401



# ── Validation helpers ──────────────────────────────────

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append('Password must be at least 8 characters long')
    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter')
    if not re.search(r'[0-9]', password):
        errors.append('Password must contain at least one digit')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\\/~`]', password):
        errors.append('Password must contain at least one special character')
    return errors


# ── Driver Sign Up ──────────────────────────────────────

@drivers_bp.route('/api/drivers/signup', methods=['POST'])
def driver_signup():
    """Register a new driver."""
    data = request.get_json()
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    password = data.get('password', '')
    vehicle_number = (data.get('vehicleNumber') or '').strip()

    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if not phone:
        return jsonify({'error': 'Phone is required'}), 400

    password_errors = validate_password(password)
    if password_errors:
        return jsonify({'error': password_errors[0], 'details': password_errors}), 400

    existing = Driver.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': 'A driver account with this email already exists'}), 409

    driver = Driver(
        name=name,
        email=email,
        phone=phone,
        password_hash='',
        vehicle_number=vehicle_number,
    )
    driver.set_password(password)
    db.session.add(driver)
    db.session.commit()

    return jsonify({
        'success': True,
        'driver': driver.to_dict(),
        'message': 'Driver account created successfully',
    }), 201


# ── Driver Sign In ──────────────────────────────────────

@drivers_bp.route('/api/drivers/signin', methods=['POST'])
def driver_signin():
    """Authenticate a driver."""
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    driver = Driver.query.filter_by(email=email).first()
    if not driver or not driver.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'success': True,
        'driver': driver.to_dict(),
    })


# ── List All Drivers (for admin assignment) ─────────────

@drivers_bp.route('/api/drivers', methods=['GET'])
def list_drivers():
    """Return all active drivers."""
    status_filter = request.args.get('status', 'Active')
    if status_filter == 'All':
        drivers = Driver.query.order_by(Driver.name.asc()).all()
    else:
        drivers = Driver.query.filter_by(status=status_filter).order_by(Driver.name.asc()).all()

    return jsonify([d.to_dict() for d in drivers])


# ── Get Pickups Assigned to a Driver ────────────────────

@drivers_bp.route('/api/drivers/<int:driver_id>/pickups', methods=['GET'])
def get_driver_pickups(driver_id):
    """Return all pickups assigned to a specific driver."""
    driver = Driver.query.get_or_404(driver_id)
    status = request.args.get('status')

    query = Pickup.query.filter_by(driver_id=driver_id).order_by(Pickup.id.desc())
    if status and status != 'All':
        query = query.filter_by(status=status)

    pickups = query.all()

    # Compute driver-specific stats
    all_driver_pickups = Pickup.query.filter_by(driver_id=driver_id).all()
    stats = [
        {'label': 'Total Assigned', 'value': len(all_driver_pickups), 'icon': '📦'},
        {'label': 'En Route', 'value': sum(1 for p in all_driver_pickups if p.status == 'En Route'), 'icon': '🚛'},
        {'label': 'Completed', 'value': sum(1 for p in all_driver_pickups if p.status == 'Completed'), 'icon': '✅'},
        {'label': 'Pending', 'value': sum(1 for p in all_driver_pickups if p.status in ('Pending', 'Confirmed')), 'icon': '⏳'},
    ]

    return jsonify({
        'driver': driver.to_dict(),
        'pickups': [p.to_dict() for p in pickups],
        'stats': stats,
    })


# ── Driver Updates a Pickup (status, location, timing) ──

@drivers_bp.route('/api/drivers/pickups/<int:pickup_id>', methods=['PATCH'])
def driver_update_pickup(pickup_id):
    """Allow a driver to update their assigned pickup."""
    pickup = Pickup.query.get_or_404(pickup_id)
    data = request.get_json()

    allowed_statuses = ['Confirmed', 'En Route', 'Pending', 'Cancelled', 'Completed']

    if 'status' in data:
        if data['status'] not in allowed_statuses:
            return jsonify({'error': f"Invalid status. Allowed: {', '.join(allowed_statuses)}"}), 400
        pickup.status = data['status']

    if 'location' in data:
        pickup.location = data['location']
    if 'time' in data:
        pickup.time = data['time']
    if 'preferredTime' in data:
        pickup.preferred_time = data['preferredTime']

    db.session.commit()
    return jsonify(pickup.to_dict())
