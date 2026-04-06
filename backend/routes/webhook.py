from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Lead, Activity, Donor

webhook_bp = Blueprint('webhook_bp', __name__)

WASTE_KEYWORDS = {
    'clothes': 'Clothes', 'clothing': 'Clothes', 'कपड़े': 'Clothes', 'kapde': 'Clothes',
    'cardboard': 'Cardboard', 'carton': 'Cardboard', 'गत्ता': 'Cardboard', 'gatta': 'Cardboard',
    'tyres': 'Tyres', 'tires': 'Tyres', 'टायर': 'Tyres', 'tyre': 'Tyres',
    'plastic': 'Plastic', 'bottle': 'Plastic', 'प्लास्टिक': 'Plastic',
    'books': 'Books', 'book': 'Books', 'किताबें': 'Books', 'kitab': 'Books',
    'electronic': 'Electronics', 'e-waste': 'Electronics', 'ewaste': 'Electronics', 'इलेक्ट्रॉनिक्स': 'Electronics',
    'other': 'Other', 'mixed': 'Other', 'अन्य': 'Other',
}

MESSAGES = {
    'en': {
        'ask_waste': "Let's schedule your pickup. What type of waste do you have?\n(e.g., Clothes, Cardboard, Tyres, Plastic, Books, Electronics, Other)",
        'ask_weight': "Great! We will collect {waste_type}.\n\nWhat is the approximate weight (in kg)?",
        'ask_location': "Got it. Lastly, what is your pickup location or full address in Nagpur?",
        'success': "✅ *Pickup Registered Successfully!*\n\n📋 *Details:*\n• Waste: {waste_type}\n• Weight: {weight} kg\n• Location: {location}\n• Request ID: #{lead_id}\n\nOur team will contact you shortly to arrange a driver. 🚛"
    },
    'hi': {
        'ask_waste': "आइए आपके पिकअप का शेड्यूल बनाएं। आपके पास किस प्रकार का कचरा है?\n(उदाहरण: कपड़े, गत्ता, टायर, प्लास्टिक, किताबें, इलेक्ट्रॉनिक्स, अन्य)",
        'ask_weight': "बहुत बढ़िया! हम {waste_type} इकट्ठा करेंगे।\n\nअनुमानित वजन (किलो में) क्या है?",
        'ask_location': "समझ गए। अंत में, नागपुर में आपका पिकअप स्थान या पूरा पता क्या है?",
        'success': "✅ *पिकअप सफलतापूर्वक दर्ज किया गया!*\n\n📋 *विवरण:*\n• कचरा: {waste_type}\n• वजन: {weight} किलो\n• स्थान: {location}\n• अनुरोध आईडी: #{lead_id}\n\nड्राइवर की व्यवस्था करने के लिए हमारी टीम जल्द ही आपसे संपर्क करेगी। 🚛"
    }
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
    
    # Step 1: Initial contact (ask language)
    if phone not in user_sessions:
        user_sessions[phone] = {'step': 'ask_language', 'sender_name': sender_name}
        reply = (
            "🌿 *Welcome to Amar Swarup Foundation!* 🌿\n\n"
            "Please choose your language / कृपया अपनी भाषा चुनें:\n"
            "1️⃣ English\n"
            "2️⃣ हिंदी (Hindi)"
        )
        return send_twiml(reply)

    session = user_sessions[phone]
    step = session['step']

    if step == 'ask_language':
        if '1' in message or 'english' in message.lower() or 'en' in message.lower():
            session['lang'] = 'en'
        elif '2' in message or 'hindi' in message.lower() or 'hi' in message.lower() or 'हिंदी' in message:
            session['lang'] = 'hi'
        else:
            session['lang'] = 'en' # Default to English if invalid input
        
        session['step'] = 'ask_waste'
        lang = session['lang']
        reply = MESSAGES[lang]['ask_waste']
        return send_twiml(reply)

    elif step == 'ask_waste':
        waste_type = detect_waste_type(message)
        session['waste_type'] = waste_type
        session['step'] = 'ask_weight'
        lang = session.get('lang', 'en')
        
        display_waste = waste_type
        if lang == 'hi':
            waste_hi_map = {'Clothes': 'कपड़े', 'Cardboard': 'गत्ता', 'Tyres': 'टायर', 'Plastic': 'प्लास्टिक', 'Books': 'किताबें', 'Electronics': 'इलेक्ट्रॉनिक्स', 'Other': 'अन्य'}
            display_waste = waste_hi_map.get(waste_type, waste_type)
            
        return send_twiml(MESSAGES[lang]['ask_weight'].format(waste_type=display_waste))

    elif step == 'ask_weight':
        import re
        weight_val = 0.0
        match = re.search(r'(\d+\.?\d*)', message)
        if match:
            weight_val = float(match.group(1))
        
        session['weight'] = weight_val
        session['step'] = 'ask_location'
        lang = session.get('lang', 'en')
        return send_twiml(MESSAGES[lang]['ask_location'])

    elif step == 'ask_location':
        session['location'] = message
        lang = session.get('lang', 'en')
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

        # Translate back for display if needed
        display_waste = session['waste_type']
        if lang == 'hi':
            waste_hi_map = {'Clothes': 'कपड़े', 'Cardboard': 'गत्ता', 'Tyres': 'टायर', 'Plastic': 'प्लास्टिक', 'Books': 'किताबें', 'Electronics': 'इलेक्ट्रॉनिक्स', 'Other': 'अन्य'}
            display_waste = waste_hi_map.get(session['waste_type'], session['waste_type'])

        reply = MESSAGES[lang]['success'].format(
            waste_type=display_waste,
            weight=weight,
            location=session['location'],
            lead_id=lead.id
        )
        return send_twiml(reply)
