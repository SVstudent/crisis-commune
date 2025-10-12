#!/bin/bash

# Crisis Commune Backend Setup Script

echo "Setting up Crisis Commune Backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

echo "Backend setup complete!"
echo "To start the backend server:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run the app: python app.py"
echo "3. Or use Flask CLI: flask run"
