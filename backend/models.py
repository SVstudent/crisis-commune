from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

# This will be imported from app.py
db = None

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
