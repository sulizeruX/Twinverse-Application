@echo off
REM Script to run the FastAPI backend server for the Dashboard AI Chat

REM Navigate to the backend directory
cd backend

REM Create a Python virtual environment if it doesn't exist
if not exist venv (
  echo Creating Python virtual environment...
  python -m venv venv
)

REM Activate the virtual environment
call venv\Scripts\activate.bat

REM Install required packages
echo Installing required packages...
pip install -r requirements.txt

REM Run the FastAPI server with uvicorn
echo Starting FastAPI server at http://localhost:8000...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
