from flask import Blueprint, request, jsonify
from app import db, Incident, Agent, Log, AgentResponse, IncidentStatus, AgentStatus
from datetime import datetime
import json

api = Blueprint('api', __name__, url_prefix='/api')

# Incident routes
@api.route('/incidents', methods=['GET'])
def get_incidents():
    """Get all incidents"""
    incidents = Incident.query.all()
    return jsonify([{
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'location': incident.location,
        'latitude': incident.latitude,
        'longitude': incident.longitude,
        'status': incident.status.value if incident.status else None,
        'priority': incident.priority,
        'created_at': incident.created_at.isoformat() if incident.created_at else None,
        'updated_at': incident.updated_at.isoformat() if incident.updated_at else None
    } for incident in incidents])

@api.route('/incidents', methods=['POST'])
def create_incident():
    """Create a new incident"""
    data = request.get_json()
    
    incident = Incident(
        title=data.get('title'),
        description=data.get('description'),
        location=data.get('location'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        priority=data.get('priority', 1)
    )
    
    db.session.add(incident)
    db.session.commit()
    
    return jsonify({
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'location': incident.location,
        'latitude': incident.latitude,
        'longitude': incident.longitude,
        'status': incident.status.value,
        'priority': incident.priority,
        'created_at': incident.created_at.isoformat(),
        'updated_at': incident.updated_at.isoformat()
    }), 201

@api.route('/incidents/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    """Get a specific incident"""
    incident = Incident.query.get_or_404(incident_id)
    return jsonify({
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'location': incident.location,
        'latitude': incident.latitude,
        'longitude': incident.longitude,
        'status': incident.status.value if incident.status else None,
        'priority': incident.priority,
        'created_at': incident.created_at.isoformat() if incident.created_at else None,
        'updated_at': incident.updated_at.isoformat() if incident.updated_at else None
    })

@api.route('/incidents/<int:incident_id>', methods=['PUT'])
def update_incident(incident_id):
    """Update a specific incident"""
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    
    incident.title = data.get('title', incident.title)
    incident.description = data.get('description', incident.description)
    incident.location = data.get('location', incident.location)
    incident.latitude = data.get('latitude', incident.latitude)
    incident.longitude = data.get('longitude', incident.longitude)
    incident.priority = data.get('priority', incident.priority)
    
    if 'status' in data:
        incident.status = IncidentStatus(data['status'])
    
    incident.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'location': incident.location,
        'latitude': incident.latitude,
        'longitude': incident.longitude,
        'status': incident.status.value,
        'priority': incident.priority,
        'created_at': incident.created_at.isoformat(),
        'updated_at': incident.updated_at.isoformat()
    })

@api.route('/incidents/<int:incident_id>', methods=['DELETE'])
def delete_incident(incident_id):
    """Delete a specific incident"""
    incident = Incident.query.get_or_404(incident_id)
    db.session.delete(incident)
    db.session.commit()
    return '', 204

# Agent routes
@api.route('/agents', methods=['GET'])
def get_agents():
    """Get all agents"""
    agents = Agent.query.all()
    return jsonify([{
        'id': agent.id,
        'name': agent.name,
        'role': agent.role,
        'status': agent.status.value if agent.status else None,
        'capabilities': agent.capabilities,
        'created_at': agent.created_at.isoformat() if agent.created_at else None,
        'updated_at': agent.updated_at.isoformat() if agent.updated_at else None
    } for agent in agents])

@api.route('/agents', methods=['POST'])
def create_agent():
    """Create a new agent"""
    data = request.get_json()
    
    agent = Agent(
        name=data.get('name'),
        role=data.get('role'),
        capabilities=data.get('capabilities')
    )
    
    db.session.add(agent)
    db.session.commit()
    
    return jsonify({
        'id': agent.id,
        'name': agent.name,
        'role': agent.role,
        'status': agent.status.value,
        'capabilities': agent.capabilities,
        'created_at': agent.created_at.isoformat(),
        'updated_at': agent.updated_at.isoformat()
    }), 201

@api.route('/agents/<int:agent_id>', methods=['PUT'])
def update_agent_status(agent_id):
    """Update agent status"""
    agent = Agent.query.get_or_404(agent_id)
    data = request.get_json()
    
    if 'status' in data:
        agent.status = AgentStatus(data['status'])
    
    agent.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'id': agent.id,
        'name': agent.name,
        'role': agent.role,
        'status': agent.status.value,
        'capabilities': agent.capabilities,
        'created_at': agent.created_at.isoformat(),
        'updated_at': agent.updated_at.isoformat()
    })

# Log routes
@api.route('/logs', methods=['GET'])
def get_logs():
    """Get all logs"""
    logs = Log.query.order_by(Log.timestamp.desc()).all()
    return jsonify([{
        'id': log.id,
        'incident_id': log.incident_id,
        'timestamp': log.timestamp.isoformat() if log.timestamp else None,
        'level': log.level,
        'message': log.message,
        'source': log.source,
        'metadata': log.log_metadata
    } for log in logs])

@api.route('/logs', methods=['POST'])
def create_log():
    """Create a new log entry"""
    data = request.get_json()
    
    log = Log(
        incident_id=data.get('incident_id'),
        level=data.get('level'),
        message=data.get('message'),
        source=data.get('source'),
        metadata=data.get('metadata')
    )
    
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'id': log.id,
        'incident_id': log.incident_id,
        'timestamp': log.timestamp.isoformat(),
        'level': log.level,
        'message': log.message,
        'source': log.source,
        'metadata': log.log_metadata
    }), 201

# Agent Response routes
@api.route('/agent-responses', methods=['GET'])
def get_agent_responses():
    """Get all agent responses"""
    responses = AgentResponse.query.order_by(AgentResponse.timestamp.desc()).all()
    return jsonify([{
        'id': response.id,
        'incident_id': response.incident_id,
        'agent_id': response.agent_id,
        'timestamp': response.timestamp.isoformat() if response.timestamp else None,
        'response_type': response.response_type,
        'content': response.content,
        'confidence': response.confidence,
        'metadata': response.response_metadata
    } for response in responses])

@api.route('/agent-responses', methods=['POST'])
def create_agent_response():
    """Create a new agent response"""
    data = request.get_json()
    
    response = AgentResponse(
        incident_id=data.get('incident_id'),
        agent_id=data.get('agent_id'),
        response_type=data.get('response_type'),
        content=data.get('content'),
        confidence=data.get('confidence'),
        metadata=data.get('metadata')
    )
    
    db.session.add(response)
    db.session.commit()
    
    return jsonify({
        'id': response.id,
        'incident_id': response.incident_id,
        'agent_id': response.agent_id,
        'timestamp': response.timestamp.isoformat(),
        'response_type': response.response_type,
        'content': response.content,
        'confidence': response.confidence,
        'metadata': response.response_metadata
    }), 201
