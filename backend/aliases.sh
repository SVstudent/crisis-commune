#!/bin/bash
# Crisis Commune - Shell Aliases Setup
# Source this file to add convenient aliases to your current shell session
# To make permanent, add to your ~/.zshrc: source /path/to/this/file

# Get project root (assumes this script is in backend/)
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Backend aliases
alias backend-start="cd $PROJECT_ROOT && ./backend/start.sh"
alias backend-shell="cd $PROJECT_ROOT && source .venv/bin/activate && cd backend"
alias backend-install="cd $PROJECT_ROOT && source .venv/bin/activate && cd backend && pip install -r requirements.txt"

# Frontend aliases  
alias frontend-start="cd $PROJECT_ROOT/frontend && npm run dev"
alias frontend-install="cd $PROJECT_ROOT/frontend && npm install"

# Combined
alias crisis-start="cd $PROJECT_ROOT && (./backend/start.sh &) && cd frontend && npm run dev"

echo "✅ Crisis Commune aliases loaded!"
echo ""
echo "Available commands:"
echo "  backend-start    - Start backend server (auto-activates venv)"
echo "  backend-shell    - Open backend shell with venv activated"
echo "  backend-install  - Install backend dependencies"
echo "  frontend-start   - Start frontend dev server"
echo "  frontend-install - Install frontend dependencies"
echo "  crisis-start     - Start both backend and frontend"
echo ""
echo "💡 To make these permanent, add this to your ~/.zshrc:"
echo "   source $PROJECT_ROOT/backend/aliases.sh"
