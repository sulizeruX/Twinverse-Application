#!/bin/bash

# Script to run the FastAPI backend server for the Dashboard AI Chat

# Navigate to the backend directory
cd backend

# Create a Python virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install required packages
echo "Installing required packages..."
pip install -r requirements.txt

# Run the FastAPI server with uvicorn
echo "Starting FastAPI server at http://localhost:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
