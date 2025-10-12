from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///crisis_commune.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# Define models here to avoid circular imports
from datetime import datetime
from enum import Enum

class IncidentStatus(Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    INVESTIGATING = "investigating"

class AgentStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"

class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    status = db.Column(db.Enum(IncidentStatus), default=IncidentStatus.ACTIVE)
    priority = db.Column(db.Integer, default=1)  # 1-5 scale
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    logs = db.relationship('Log', backref='incident', lazy=True, cascade='all, delete-orphan')
    agent_responses = db.relationship('AgentResponse', backref='incident', lazy=True, cascade='all, delete-orphan')

class Agent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum(AgentStatus), default=AgentStatus.OFFLINE)
    capabilities = db.Column(db.JSON, nullable=True)  # Store capabilities as JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    responses = db.relationship('AgentResponse', backref='agent', lazy=True, cascade='all, delete-orphan')

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incident.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    level = db.Column(db.String(20), nullable=False)  # INFO, WARNING, ERROR, etc.
    message = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(100), nullable=True)
    log_metadata = db.Column(db.JSON, nullable=True)  # Store additional metadata as JSON

class AgentResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incident.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    response_type = db.Column(db.String(50), nullable=False)  # text, action, recommendation, etc.
    content = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float, nullable=True)  # 0.0 to 1.0
    response_metadata = db.Column(db.JSON, nullable=True)  # Store additional metadata as JSON

# Import routes after models are defined
from routes import *
from deepgram_agent import create_voice_routes

# Create voice routes
create_voice_routes(app)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Crisis Commune API is running',
        'deepgram_enabled': bool(os.getenv('DEEPGRAM_API_KEY'))
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)