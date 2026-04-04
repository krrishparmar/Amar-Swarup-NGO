import os
from flask import Flask
from flask_cors import CORS
from models import db

from routes.auth import auth_bp
from routes.webhook import webhook_bp
from routes.leads import leads_bp
from routes.pickups import pickups_bp
from routes.donors import donors_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///amar_swarup.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize extensions
CORS(app)
db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(webhook_bp)
app.register_blueprint(leads_bp)
app.register_blueprint(pickups_bp)
app.register_blueprint(donors_bp)
app.register_blueprint(dashboard_bp)

# Startup
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
