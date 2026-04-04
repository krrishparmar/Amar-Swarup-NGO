from flask import Blueprint, jsonify
from models import db, Donor, Pickup, Lead, Activity, MonthlyReport, WasteBreakdown, TopArea

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/api/kpi', methods=['GET'])
def get_kpi():
    """Return computed KPI statistics."""
    total_waste = db.session.query(db.func.sum(Donor.total_kg)).scalar() or 0
    todays_pickups = Pickup.query.filter(Pickup.status.in_(['Scheduled', 'Confirmed', 'Pending'])).count()
    active_leads = Lead.query.filter(Lead.status.in_(['Pending', 'Confirmed'])).count()
    total_donors = Donor.query.count()
    completed_pickups = Pickup.query.filter_by(status='Completed').count()

    kpi_data = [
        {'label': 'Total Waste Collected', 'value': round(total_waste, 1), 'suffix': ' kg', 'icon': '♻️'},
        {'label': "Today's Scheduled Pickups", 'value': todays_pickups, 'suffix': '', 'icon': '📅'},
        {'label': 'Active WhatsApp Leads', 'value': active_leads, 'suffix': '', 'icon': '💬'},
        {'label': 'Total Donors Registered', 'value': total_donors, 'suffix': '', 'icon': '🤝'},
        {'label': 'Pickups Completed This Month', 'value': completed_pickups, 'suffix': '', 'icon': '✅'},
    ]
    return jsonify(kpi_data)

@dashboard_bp.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Return donors ranked by total kg donated."""
    donors = Donor.query.order_by(Donor.total_kg.desc()).all()
    return jsonify([d.to_leaderboard_dict(i + 1) for i, d in enumerate(donors)])

@dashboard_bp.route('/api/activity', methods=['GET'])
def get_activity():
    """Return recent activity feed entries."""
    activities = Activity.query.order_by(Activity.id.asc()).all()
    return jsonify([a.to_dict() for a in activities])

@dashboard_bp.route('/api/reports', methods=['GET'])
def get_reports():
    """Return all report data: monthly trends, waste breakdown, top areas."""
    monthly = MonthlyReport.query.order_by(MonthlyReport.id.asc()).all()
    waste = WasteBreakdown.query.order_by(WasteBreakdown.id.asc()).all()
    areas = TopArea.query.order_by(TopArea.pickups.desc()).all()

    return jsonify({
        'monthlyData': [m.to_dict() for m in monthly],
        'wasteBreakdown': [w.to_dict() for w in waste],
        'topAreas': [a.to_dict() for a in areas],
    })
