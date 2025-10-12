# Crisis Commune Development Environment

## Backend Dependencies
- Python 3.8+
- Flask 3.0.0
- SQLAlchemy
- Flask-CORS
- Flask-Migrate

## Frontend Dependencies
- Node.js 18+
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components

## Environment Variables

### Backend (.env)
```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///crisis_commune.db
```

### Frontend
The frontend automatically proxies API requests to the backend.

## Development Workflow

1. **Start Backend**: `cd backend && source venv/bin/activate && python app.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Or Run Both**: `npm run dev` (from root directory)

## Database

The backend uses SQLite by default for development. For production, configure PostgreSQL in the `.env` file.

## API Documentation

The API follows RESTful conventions:
- GET `/api/incidents` - List incidents
- POST `/api/incidents` - Create incident
- GET `/api/agents` - List agents
- GET `/api/logs` - Get logs
- GET `/api/agent-responses` - Get agent responses
