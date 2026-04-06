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

import datetime
from collections import defaultdict

@dashboard_bp.route('/api/reports', methods=['GET'])
def get_reports():
    """Return report data dynamically computed from live Pickups."""
    pickups = Pickup.query.all()

    # 1. Monthly Data
    month_map = defaultdict(lambda: {'waste': 0.0, 'pickups': 0, 'donors': set(), 'sort_key': ''})
    
    for p in pickups:
        dt = p.created_at or datetime.datetime.utcnow()
        m_label = dt.strftime('%b %Y')
        sort_key = dt.strftime('%Y-%m')
        
        month_map[m_label]['sort_key'] = sort_key
        month_map[m_label]['pickups'] += 1
        if p.donor: month_map[m_label]['donors'].add(p.donor)
        
        try: month_map[m_label]['waste'] += float(str(p.weight).replace('kg', '').strip())
        except: pass

    # Sort chronologically
    sorted_months = sorted(month_map.items(), key=lambda x: x[1]['sort_key'])
    monthly_data = []
    for m_label, stats in sorted_months:
        monthly_data.append({
            'month': m_label,
            'waste': round(stats['waste'], 1),
            'pickups': stats['pickups'],
            'donors': len(stats['donors'])
        })

    # 2. Waste Breakdown
    waste_totals = defaultdict(float)
    total_waste = 0.0
    for p in pickups:
        try: w = float(str(p.weight).replace('kg', '').strip())
        except: w = 0.0
        if p.waste_type:
            waste_totals[p.waste_type] += w
            total_waste += w

    waste_colors = {
        'Electronics': '#0d9488',
        'Plastic': '#3b82f6',
        'Clothes': '#a855f7',
        'Paper': '#fbbf24',
        'Glass': '#ec4899'
    }

    waste_breakdown = []
    for wtype, w in sorted(waste_totals.items(), key=lambda x: x[1], reverse=True):
        percent = (w / total_waste * 100) if total_waste > 0 else 0
        waste_breakdown.append({
            'type': wtype,
            'kg': round(w, 1),
            'percent': round(percent, 1),
            'color': waste_colors.get(wtype, '#94a3b8')
        })

    # 3. Top Areas
    area_stats = defaultdict(lambda: {'pickups': 0, 'kg': 0.0})
    for p in pickups:
        loc = p.location or 'Unknown'
        area_stats[loc]['pickups'] += 1
        try: area_stats[loc]['kg'] += float(str(p.weight).replace('kg', '').strip())
        except: pass

    top_areas = []
    for area, stats in sorted(area_stats.items(), key=lambda x: x[1]['pickups'], reverse=True)[:5]:
        top_areas.append({
            'area': area,
            'pickups': stats['pickups'],
            'kg': round(stats['kg'], 1)
        })

    return jsonify({
        'monthlyData': monthly_data,
        'wasteBreakdown': waste_breakdown,
        'topAreas': top_areas,
    })
