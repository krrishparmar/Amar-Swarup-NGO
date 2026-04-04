from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Lead, Activity, Donor

webhook_bp = Blueprint('webhook_bp', __name__)

WASTE_KEYWORDS = {
    'clothes': 'Clothes', 'clothing': 'Clothes',
    'cardboard': 'Cardboard', 'carton': 'Cardboard',
    'tyres': 'Tyres', 'tires': 'Tyres',
    'plastic': 'Plastic', 'bottle': 'Plastic',
    'books': 'Books', 'book': 'Books',
    'electronic': 'Electronics', 'e-waste': 'Electronics', 'ewaste': 'Electronics',
    'other': 'Other', 'mixed': 'Other',
}

# In-memory dictionary to track conversational state per phone number
# Structure: { 'phone': { 'step': '...', 'sender_name': '...', 'waste_type': '...', ... } }
user_sessions = {}

def detect_waste_type(message):
    msg_lower = message.lower()
    for keyword, waste_type in WASTE_KEYWORDS.items():
        if keyword in msg_lower:
            return waste_type
    return 'Other'

def send_twiml(message):
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""
    return twiml_response, 200, {'Content-Type': 'text/xml'}

def get_sender_info():
    sender = request.form.get('From', '') or request.form.get('from', '')
    message = request.form.get('Body', '') or request.form.get('body', '')
    sender_name = request.form.get('ProfileName', '') or request.form.get('profileName', sender)
    
    if not sender and not message:
        data = request.get_json(silent=True) or {}
        sender = data.get('from', data.get('phone', ''))
        message = data.get('body', data.get('message', ''))
        sender_name = data.get('name', data.get('profileName', sender))
        
    return sender, message.strip(), sender_name

@webhook_bp.route('/webhook', methods=['GET'])
def webhook_verify():
    """Handle Twilio/WhatsApp webhook verification (GET)."""
    return "Amar Swarup WhatsApp Webhook Active", 200

@webhook_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle multi-step WhatsApp chatbot flow."""
    sender, message, sender_name = get_sender_info()
    if not message:
        return jsonify({'error': 'No message body received'}), 400

    phone = sender.replace('whatsapp:', '').strip()
    
    # Step 1: Initial contact
    if phone not in user_sessions:
        user_sessions[phone] = {'step': 'ask_waste', 'sender_name': sender_name}
        reply = (
            "🌿 *Welcome to Amar Swarup Foundation!* 🌿\n\n"
            "Let's schedule your pickup. What type of waste do you have?\n"
            "(e.g., Clothes, Cardboard, Tyres, Plastic, Books, Electronics, Other)"
        )
        return send_twiml(reply)

    session = user_sessions[phone]
    step = session['step']

    if step == 'ask_waste':
        waste_type = detect_waste_type(message)
        session['waste_type'] = waste_type
        session['step'] = 'ask_weight'
        return send_twiml(f"Great! We will collect {waste_type}.\n\nWhat is the approximate weight (in kg)?")

    elif step == 'ask_weight':
        import re
        weight_val = 0.0
        match = re.search(r'(\d+\.?\d*)', message)
        if match:
            weight_val = float(match.group(1))
        
        session['weight'] = weight_val
        session['step'] = 'ask_location'
        return send_twiml("Got it. Lastly, what is your pickup location or full address in Nagpur?")

    elif step == 'ask_location':
        session['location'] = message
        now = datetime.now()
        
        # We have all data
        # Step 5: Auto-create donor
        donor = Donor.query.filter_by(phone=phone).first()
        if not donor:
            donor = Donor(
                name=session['sender_name'] or phone,
                email=f"{phone}@no-email.com",
                phone=phone,
                location=session['location'],
                join_date=now.strftime('%Y-%m-%d'),
                total_kg=0.0,
                pickups=0
            )
            db.session.add(donor)
            db.session.commit() # Commit to instantly assign ID and make it queryable

        weight = float(session['weight'])

        # Step 6: Update donor stats
        donor.total_kg += weight
        donor.pickups += 1

        # Create Lead
        lead = Lead(
            name=session['sender_name'] or phone,
            location=session['location'],
            phone=phone,
            waste_type=session['waste_type'],
            date=now.strftime('%Y-%m-%d'),
            time=now.strftime('%I:%M %p'),
            weight=weight,
            status='Pending',
        )
        db.session.add(lead)

        # Create Activity Log
        activity = Activity(
            donor=session['sender_name'] or phone,
            location=session['location'],
            waste_type=session['waste_type'],
            weight=f"{weight} kg" if weight > 0 else f"{session['weight']}",
            time='just now',
        )
        db.session.add(activity)
        
        db.session.commit()

        # Clear session
        del user_sessions[phone]

        reply = (
            f"✅ *Pickup Registered Successfully!*\n\n"
            f"📋 *Details:*\n"
            f"• Waste: {session['waste_type']}\n"
            f"• Weight: {weight} kg\n"
            f"• Location: {session['location']}\n"
            f"• Request ID: #{lead.id}\n\n"
            f"Our team will contact you shortly to arrange a driver. 🚛"
        )
        return send_twiml(reply)
