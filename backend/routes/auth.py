import os
from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

auth_bp = Blueprint('auth_bp', __name__)

GOOGLE_CLIENT_ID = os.environ.get(
    'GOOGLE_CLIENT_ID',
    '159199212470-dopq7jgrd42jh95im7ngh6ntt4hddq8e.apps.googleusercontent.com'
)

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
