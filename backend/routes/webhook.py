from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Lead, Activity, Donor
import re

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
        'welcome': (
            "🌿 *Welcome to Amar Swarup Foundation!* 🌿\n\n"
            "Please choose your language:\n"
            "1️⃣ English\n"
            "2️⃣ हिंदी (Hindi)\n\n"
            "Type *exit* to quit."
        ),
        'invalid_language': "❌ Invalid choice. Please enter *1* for English or *2* for Hindi. Type *exit* to quit.",
        'exit': "👋 Thank you for contacting Amar Swarup Foundation. Goodbye!",
        'ask_waste': (
            "Let's schedule your pickup! What type of waste do you have?\n\n"
            "Choose from: *Clothes, Cardboard, Tyres, Plastic, Books, Electronics, Other*"
        ),
        'invalid_waste': (
            "❌ We couldn't identify that waste type. Please enter one of:\n"
            "*Clothes, Cardboard, Tyres, Plastic, Books, Electronics, Other*"
        ),
        'ask_weight': "Great! We will collect *{waste_type}*.\n\nWhat is the approximate weight (in kg)? Please enter a number (e.g., 5 or 10.5).",
        'invalid_weight': "❌ Invalid input. Please enter a valid number for weight (e.g., 5 or 10.5).",
        'ask_location': "Got it — *{weight} kg*. Now, what is your pickup location or full address in Nagpur?",
        'invalid_location': "❌ Please enter a valid address (at least 3 characters).",
        'ask_date': (
            "📍 Location saved: *{location}*\n\n"
            "On which *date* should we schedule the pickup? (e.g., Tomorrow, 10th April, or 2024-04-12)"
        ),
        'invalid_date': "❌ Please enter a valid date (e.g., Tomorrow, 15th Oct).",
        'ask_time': "Great! And what *time* would you prefer? (e.g., 10 AM, 3 PM, or Morning)",
        'invalid_time': "❌ Please enter a valid time (e.g., 11 AM).",
        'success': (
            "✅ *Pickup Registered Successfully!*\n\n"
            "📋 *Details:*\n"
            "• Waste: {waste_type}\n"
            "• Weight: {weight} kg\n"
            "• Location: {location}\n"
            "• Scheduled for: {date} at {time}\n"
            "• Request ID: #{lead_id}\n\n"
            "Our team will contact you shortly to arrange a driver. 🚛"
        ),
    },
    'hi': {
        'welcome': (
            "🌿 *अमर स्वरूप फाउंडेशन में आपका स्वागत है!* 🌿\n\n"
            "कृपया अपनी भाषा चुनें:\n"
            "1️⃣ English\n"
            "2️⃣ हिंदी (Hindi)\n\n"
            "*exit* टाइप करें बाहर निकलने के लिए।"
        ),
        'invalid_language': "❌ अमान्य विकल्प। कृपया English के लिए *1* या हिंदी के लिए *2* दर्ज करें। बाहर निकलने के लिए *exit* टाइप करें।",
        'exit': "👋 अमर स्वरूप फाउंडेशन से संपर्क करने के लिए धन्यवाद। अलविदा!",
        'ask_waste': (
            "आइए आपके पिकअप का शेड्यूल बनाएं! आपके पास किस प्रकार का कचरा है?\n\n"
            "चुनें: *कपड़े, गत्ता, टायर, प्लास्टिक, किताबें, इलेक्ट्रॉनिक्स, अन्य*"
        ),
        'invalid_waste': (
            "❌ हम उस कचरे के प्रकार की पहचान नहीं कर सके। कृपया इनमें से एक दर्ज करें:\n"
            "*कपड़े, गत्ता, टायर, प्लास्टिक, किताबें, इलेक्ट्रॉनिक्स, अन्य*"
        ),
        'ask_weight': "बहुत बढ़िया! हम *{waste_type}* इकट्ठा करेंगे।\n\nअनुमानित वजन (किलो में) क्या है? कृपया एक संख्या दर्ज करें (जैसे 5 या 10.5)।",
        'invalid_weight': "❌ अमान्य इनपुट। कृपया वजन के लिए एक मान्य संख्या दर्ज करें (जैसे 5 या 10.5)।",
        'ask_location': "समझ गए — *{weight} किलो*। अब, नागपुर में आपका पिकअप स्थान या पूरा पता क्या है?",
        'invalid_location': "❌ कृपया एक मान्य पता दर्ज करें (कम से कम 3 अक्षर)।",
        'ask_date': (
            "📍 स्थान सहेजा गया: *{location}*\n\n"
            "हमें किस *तारीख* पर पिकअप शेड्यूल करना चाहिए? (जैसे कल, 10 अप्रैल, या 2024-04-12)"
        ),
        'invalid_date': "❌ कृपया एक मान्य तारीख दर्ज करें (जैसे कल, 15 अक्टूबर)।",
        'ask_time': "बहुत अच्छा! और आप किस *समय* पिकअप पसंद करेंगे? (जैसे सुबह 10 बजे, दोपहर 3 बजे, या सुबह)",
        'invalid_time': "❌ कृपया एक मान्य समय दर्ज करें (जैसे 11 AM)।",
        'success': (
            "✅ *पिकअप सफलतापूर्वक दर्ज किया गया!*\n\n"
            "📋 *विवरण:*\n"
            "• कचरा: {waste_type}\n"
            "• वजन: {weight} किलो\n"
            "• स्थान: {location}\n"
            "• पिकअप का समय: {date} को {time}\n"
            "• अनुरोध आईडी: #{lead_id}\n\n"
            "ड्राइवर की व्यवस्था करने के लिए हमारी टीम जल्द ही आपसे संपर्क करेगी। 🚛"
        ),
    }
}

WASTE_HI_MAP = {
    'Clothes': 'कपड़े', 'Cardboard': 'गत्ता', 'Tyres': 'टायर',
    'Plastic': 'प्लास्टिक', 'Books': 'किताबें',
    'Electronics': 'इलेक्ट्रॉनिक्स', 'Other': 'अन्य',
}


# In-memory sessions: { 'phone': { 'step': '...', ... } }
user_sessions = {}


def detect_waste_type(message):
    """Match a waste type keyword from the message. Returns None if no match."""
    msg_lower = message.lower().strip()
    for keyword, waste_type in WASTE_KEYWORDS.items():
        if keyword in msg_lower:
            return waste_type
    return None


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
    """Handle multi-step WhatsApp chatbot flow with strict validation."""
    sender, message, sender_name = get_sender_info()
    if not message:
        return jsonify({'error': 'No message body received'}), 400

    phone = sender.replace('whatsapp:', '').strip()
    msg_lower = message.lower().strip()

    # ── Check for exit at any point ──
    try:
        with open('webhook.log', 'a') as f:
            f.write(f"{datetime.now()}: Incoming from {phone}: '{message}' (Step: {user_sessions.get(phone, {}).get('step', 'New')})\n")
    except:
        pass
    if msg_lower == 'exit':
        if phone in user_sessions:
            del user_sessions[phone]
        lang = 'en'
        return send_twiml(MESSAGES[lang]['exit'])

    # ── Step 1: New user — show welcome / ask language ──
    if phone not in user_sessions:
        user_sessions[phone] = {'step': 'ask_language', 'sender_name': sender_name}
        return send_twiml(MESSAGES['en']['welcome'])

    session = user_sessions[phone]
    step = session['step']
    lang = session.get('lang', 'en')

    # ── Step 2: Language selection (strict: only 1 or 2) ──
    if step == 'ask_language':
        if msg_lower == '1':
            session['lang'] = 'en'
        elif msg_lower == '2':
            session['lang'] = 'hi'
        else:
            return send_twiml(MESSAGES['en']['invalid_language'])

        session['step'] = 'ask_waste'
        lang = session['lang']
        return send_twiml(MESSAGES[lang]['ask_waste'])

    # ── Step 3: Waste type (validate against keywords) ──
    elif step == 'ask_waste':
        waste_type = detect_waste_type(message)
        if waste_type is None:
            return send_twiml(MESSAGES[lang]['invalid_waste'])

        session['waste_type'] = waste_type
        session['step'] = 'ask_weight'

        display_waste = WASTE_HI_MAP.get(waste_type, waste_type) if lang == 'hi' else waste_type
        return send_twiml(MESSAGES[lang]['ask_weight'].format(waste_type=display_waste))

    # ── Step 4: Weight (strict numeric validation) ──
    elif step == 'ask_weight':
        match = re.search(r'(\d+\.?\d*)', message)
        if not match:
            return send_twiml(MESSAGES[lang]['invalid_weight'])

        weight_val = float(match.group(1))
        if weight_val <= 0:
            return send_twiml(MESSAGES[lang]['invalid_weight'])

        session['weight'] = weight_val
        session['step'] = 'ask_location'
        return send_twiml(MESSAGES[lang]['ask_location'].format(weight=weight_val))

    # ── Step 5: Location (validate non-empty, min 3 chars) ──
    elif step == 'ask_location':
        if len(message.strip()) < 3:
            return send_twiml(MESSAGES[lang]['invalid_location'])

        session['location'] = message.strip()
        session['step'] = 'ask_date'
        return send_twiml(MESSAGES[lang]['ask_date'].format(location=session['location']))

    # ── Step 6: Preferred Date ──
    elif step == 'ask_date':
        if not message.strip():
            return send_twiml(MESSAGES[lang]['invalid_date'])
        
        session['date'] = message.strip()
        session['step'] = 'ask_time'
        return send_twiml(MESSAGES[lang]['ask_time'])

    # ── Step 7: Preferred Time ──
    elif step == 'ask_time':
        if not message.strip():
            return send_twiml(MESSAGES[lang]['invalid_time'])

        session['time'] = message.strip()
        
        # ── ALL DATA COLLECTED — Save to DB ──
        now = datetime.now()
        phone = sender.replace('whatsapp:', '').strip()

        # Auto-create or update donor
        donor = Donor.query.filter_by(phone=phone).first()
        if not donor:
            donor = Donor(
                name=session['sender_name'] or phone,
                email=f"{phone}@no-email.com",
                phone=phone,
                location=session['location'],
                join_date=now.strftime('%Y-%m-%d'),
                total_kg=0.0,
                pickups=0,
            )
            db.session.add(donor)
            db.session.commit()

        weight = float(session['weight'])

        # Update donor stats
        donor.total_kg += weight
        donor.pickups += 1

        # Update donor tier based on total kg
        if donor.total_kg > 150:
            donor.tier = 'champion'
        elif donor.total_kg > 50:
            donor.tier = 'guardian'
        elif donor.total_kg > 10:
            donor.tier = 'recycler'
        else:
            donor.tier = 'seedling'

        # Create Lead
        lead = Lead(
            name=session['sender_name'] or phone,
            location=session['location'],
            phone=phone,
            waste_type=session['waste_type'],
            date=session['date'],
            time=session['time'],
            weight=weight,
            preferred_time=f"{session['date']} at {session['time']}",
            status='Pending',
        )
        db.session.add(lead)

        # Create Pickup for Driver Assignment
        from models import Pickup
        pickup = Pickup(
            donor=session['sender_name'] or phone,
            location=session['location'],
            phone=phone,
            waste_type=session['waste_type'],
            date=session['date'],
            time=session['time'],
            weight=weight,
            preferred_time=f"{session['date']} at {session['time']}",
            status='Pending',
            driver='Unassigned',
        )
        db.session.add(pickup)

        # Create Activity Log
        activity = Activity(
            donor=session['sender_name'] or phone,
            location=session['location'],
            waste_type=session['waste_type'],
            weight=f"{weight} kg",
            time='just now',
        )
        db.session.add(activity)

        db.session.commit()

        # Clear session
        lead_id = lead.id
        saved_data = {
            'waste_type': session['waste_type'],
            'weight': weight,
            'location': session['location'],
            'date': session['date'],
            'time': session['time'],
        }
        del user_sessions[phone]

        # Format success message
        display_waste = WASTE_HI_MAP.get(saved_data['waste_type'], saved_data['waste_type']) if lang == 'hi' else saved_data['waste_type']

        reply = MESSAGES[lang]['success'].format(
            waste_type=display_waste,
            weight=saved_data['weight'],
            location=saved_data['location'],
            date=saved_data['date'],
            time=saved_data['time'],
            lead_id=lead_id,
        )
        return send_twiml(reply)
