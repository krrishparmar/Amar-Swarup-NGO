from flask import Blueprint, request, jsonify
from models import db, Donor

donors_bp = Blueprint('donors_bp', __name__)

@donors_bp.route('/api/donors', methods=['GET'])
def get_donors():
    """Return all donors with stats, optionally filtered by search."""
    search = request.args.get('search', '').lower()
    query = Donor.query.order_by(Donor.id.asc())

    donors = query.all()
    if search:
        donors = [
            d for d in donors
            if search in d.name.lower() or search in d.location.lower()
        ]

    # Compute stats
    all_donors = Donor.query.all()
    total_kg = sum(d.total_kg for d in all_donors)
    avg_donation = round(total_kg / len(all_donors), 1) if all_donors else 0

    stats = [
        {'label': 'Total Donors', 'value': len(all_donors), 'icon': '🤝'},
        {'label': 'New This Month', 'value': 43, 'icon': '🆕'},
        {'label': 'Active Donors', 'value': len([d for d in all_donors if d.total_kg > 0]), 'icon': '💚'},
        {'label': 'Avg. Donation', 'value': f'{avg_donation} kg', 'icon': '📊'},
    ]

    return jsonify({
        'donors': [d.to_dict() for d in donors],
        'stats': stats,
    })

@donors_bp.route('/api/donors', methods=['POST'])
def create_donor():
    """Register a new donor."""
    data = request.get_json()
    donor = Donor(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        location=data['location'],
        join_date=data['joinDate'],
        total_kg=data.get('totalKg', 0),
        pickups=data.get('pickups', 0),
        tier=data.get('tier', 'seedling'),
    )
    db.session.add(donor)
    db.session.commit()
    return jsonify(donor.to_dict()), 201
