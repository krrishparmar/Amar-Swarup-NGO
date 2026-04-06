import os
import re
from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from models import db, User

auth_bp = Blueprint('auth_bp', __name__)

GOOGLE_CLIENT_ID = os.environ.get(
    'GOOGLE_CLIENT_ID',
    '159199212470-dopq7jgrd42jh95im7ngh6ntt4hddq8e.apps.googleusercontent.com'
)

# ── Email / Password Validation Helpers ───────────────────

def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password):
    """
    Password must be:
    - At least 8 characters long
    - Contain at least one uppercase letter
    - Contain at least one lowercase letter
    - Contain at least one digit
    - Contain at least one special character
    """
    errors = []
    if len(password) < 8:
        errors.append('Password must be at least 8 characters long')
    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter')
    if not re.search(r'[0-9]', password):
        errors.append('Password must contain at least one digit')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]', password):
        errors.append('Password must contain at least one special character')
    return errors


# ── Google OAuth ──────────────────────────────────────────

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    """Verify a Google OAuth ID token and return user profile."""
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
        user_profile = {
            'name': idinfo.get('name'),
            'email': idinfo.get('email'),
            'picture': idinfo.get('picture'),
            'sub': idinfo.get('sub'),
        }
        return jsonify({'success': True, 'user': user_profile})
    except ValueError as e:
        return jsonify({'error': f'Invalid token: {str(e)}'}), 401


# ── Email + Password Sign Up ─────────────────────────────

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user with email and password."""
    data = request.get_json()
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    # Validate inputs
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    password_errors = validate_password(password)
    if password_errors:
        return jsonify({'error': password_errors[0], 'details': password_errors}), 400

    # Check if email already exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': 'An account with this email already exists'}), 409

    # Create user
    user = User(name=name, email=email, password_hash='')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'message': 'Account created successfully',
    }), 201


# ── Email + Password Sign In ─────────────────────────────

@auth_bp.route('/api/auth/signin', methods=['POST'])
def signin():
    """Authenticate a user with email and password."""
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'success': True,
        'user': user.to_dict(),
    })
