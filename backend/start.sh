#!/bin/bash
# Crisis Commune Backend Startup Script
# This ensures the virtual environment is always activated before running the app

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Crisis Commune Backend...${NC}"

# Determine which venv to use (try parent .venv first, then local venv)
VENV_PATH=""
if [ -d "../.venv" ]; then
    VENV_PATH="../.venv"
    echo -e "${GREEN}✓ Found virtual environment at ../.venv${NC}"
elif [ -d ".venv" ]; then
    VENV_PATH=".venv"
    echo -e "${GREEN}✓ Found virtual environment at .venv${NC}"
elif [ -d "venv" ]; then
    VENV_PATH="venv"
    echo -e "${GREEN}✓ Found virtual environment at venv${NC}"
else
    echo -e "${RED}✗ No virtual environment found!${NC}"
    echo -e "${YELLOW}Creating virtual environment at ../.venv${NC}"
    python3 -m venv ../.venv
    VENV_PATH="../.venv"
    echo -e "${GREEN}✓ Installing dependencies...${NC}"
    $VENV_PATH/bin/pip install --upgrade pip
    $VENV_PATH/bin/pip install -r requirements.txt
fi

# Use the venv's Python directly (no need to activate in script)
PYTHON="$VENV_PATH/bin/python"

# Verify Flask is installed
if ! $PYTHON -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Flask not found in virtual environment. Installing dependencies...${NC}"
    $VENV_PATH/bin/pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please edit .env and add your DEEPGRAM_API_KEY${NC}"
    fi
fi

# Start the Flask app with the venv's Python
echo -e "${GREEN}✓ Starting Flask server with $PYTHON${NC}"
echo ""
exec $PYTHON app.py

