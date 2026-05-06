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
from routes.drivers import drivers_bp

app = Flask(__name__)

@app.route('/')
def home():
    return "Amar Swarup API is running!"

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
db_url = os.environ.get('DATABASE_URL')

if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url or ('sqlite:///' + os.path.join(basedir, 'instance', 'amar_swarup.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS — allow frontend origin in production, everything in dev
frontend_url = os.environ.get('FRONTEND_URL', '*')
CORS(app, origins=[frontend_url] if frontend_url != '*' else ['*'])
db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(webhook_bp)
app.register_blueprint(leads_bp)
app.register_blueprint(pickups_bp)
app.register_blueprint(donors_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(drivers_bp)

# Startup
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

