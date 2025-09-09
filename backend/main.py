from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
import requests
import json
import logging
import traceback
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("dashboard_ai_api")

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

# Get API key from environment variable or use a hard-coded test key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Log API key info (masked for security)
key_info = f"length={len(GEMINI_API_KEY)}, prefix={GEMINI_API_KEY[:4]}..., suffix=...{GEMINI_API_KEY[-4:]}" if GEMINI_API_KEY else "None"
logger.info(f"Gemini API key loaded: {key_info}")

# Initialize FastAPI app
app = FastAPI(title="Dashboard AI Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class ChatRequest(BaseModel):
    message: str
    dashboardData: Dict[str, Any]

# Define response model
class ChatResponse(BaseModel):
    reply: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "BackendAPI"}

@app.get("/")
async def root():
    return {"message": "Dashboard AI Chat API"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    request_id = f"req_{datetime.now().strftime('%Y%m%d%H%M%S')}_{id(request)}"
    logger.info(f"[{request_id}] Received chat request. Message: {request.message[:50]}...")
    
    # Log dashboard data size rather than full data to avoid log bloat
    dashboard_data_size = len(json.dumps(request.dashboardData))
    logger.info(f"[{request_id}] Dashboard data size: {dashboard_data_size} bytes")
    
    try:
        # Extract specific dashboard sections to make the context more focused
        dashboard_summary = {}
        conveyor_data = {}
        
        # Process dashboard data into a more structured format
        for key, value in request.dashboardData.items():
            if key == 'dashboard':
                dashboard_summary = value
            elif key == 'conveyor-monitoring':
                conveyor_data = value
            elif key == 'lastUpdated':
                pass  # Skip for special handling
        
        # Format the prompt with user message and relevant dashboard data
        prompt = f"""You are an AI assistant for an industrial conveyor monitoring dashboard. 
User message: '{request.message}'

Current dashboard data:
"""
        
        # Add relevant sections based on what data we have
        if dashboard_summary:
            prompt += f"""
### Facility Overview:
- Facility Status: {dashboard_summary.get('facilityStatus', 'Unknown')}
- Last Updated: {dashboard_summary.get('lastUpdated', 'Unknown')}

### Conveyor Count:
- Total Conveyors: {dashboard_summary.get('conveyorCount', {}).get('total', 0)}
- Operational: {dashboard_summary.get('conveyorCount', {}).get('operational', 0)}
- Faulty: {dashboard_summary.get('conveyorCount', {}).get('faulty', 0)}
- Non-Operational: {dashboard_summary.get('conveyorCount', {}).get('nonOperational', 0)}

### Key Metrics:
- Total Production Rate: {dashboard_summary.get('metrics', {}).get('totalProductionRate', 0)} units/hour
- Average Quality: {dashboard_summary.get('metrics', {}).get('averageQuality', 0)}%
- Total Power Usage: {dashboard_summary.get('metrics', {}).get('totalPowerUsage', 0)} kW
"""

        # Add conveyor-specific data if available
        if conveyor_data:
            prompt += f"""
### Selected Conveyor Details (Conveyor {conveyor_data.get('conveyorId', 'Unknown')}):
- Status: {conveyor_data.get('status', 'Unknown')}
- Production Rate: {conveyor_data.get('metrics', {}).get('production', {}).get('rate', 0)} units/hour
- Production Efficiency: {conveyor_data.get('metrics', {}).get('production', {}).get('efficiency', 0)}%
- Quality - Dimensional Accuracy: {conveyor_data.get('metrics', {}).get('quality', {}).get('dimensionalAccuracy', 0)}%
- Quality - Defect Rate: {conveyor_data.get('metrics', {}).get('quality', {}).get('defectRate', 0)}%
- Uptime Percentage: {conveyor_data.get('metrics', {}).get('equipment', {}).get('uptimePercentage', 0)}%
- Maintenance Status: {conveyor_data.get('metrics', {}).get('equipment', {}).get('maintenanceStatus', 'Unknown')}
- Temperature: {conveyor_data.get('metrics', {}).get('facility', {}).get('temperature', 0)}°C
- Power Usage: {conveyor_data.get('metrics', {}).get('facility', {}).get('powerUsage', 0)} kW
"""

        prompt += """
Please provide a helpful response based on this information. If the user is asking for a summary or status of the dashboard, 
analyze the data and give actionable insights. If they ask about specific conveyors, focus on that data.
Keep your response concise and direct. If there are any issues or anomalies in the data, highlight them.
"""
        logger.debug(f"[{request_id}] Constructed prompt: {prompt[:200]}...")
        
        # Log API key info (length and first/last few characters only - never log the full key)
        api_key = GEMINI_API_KEY
        key_info = f"length={len(api_key)}, prefix={api_key[:4]}..., suffix=...{api_key[-4:]}" if api_key else "None"
        logger.info(f"[{request_id}] Using Gemini API key: {key_info}")

        # Prepare request payload
        request_payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 800,
            }
        }
        logger.debug(f"[{request_id}] Request payload structure: {json.dumps({k: '...' for k in request_payload}, indent=2)}")

        # Call Gemini API
        logger.info(f"[{request_id}] Calling Gemini API...")
        api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        logger.info(f"[{request_id}] API URL: {api_url}")
        
        response = requests.post(
            api_url,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key
            },
            json=request_payload
        )
        
        logger.info(f"[{request_id}] Gemini API response status code: {response.status_code}")
        logger.debug(f"[{request_id}] Gemini API response headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            error_msg = f"Gemini API error: Status {response.status_code}, Response: {response.text[:500]}"
            logger.error(f"[{request_id}] {error_msg}")
            raise HTTPException(status_code=response.status_code, detail=error_msg)
        
        # Process the response
        try:
            result = response.json()
            logger.debug(f"[{request_id}] Raw API response structure: {json.dumps({k: '...' for k in result}, indent=2)}")
            
            # Extract text from Gemini response
            reply_text = result["candidates"][0]["content"]["parts"][0]["text"]
            logger.info(f"[{request_id}] Successfully extracted response text: {reply_text[:100]}...")
            return {"reply": reply_text}
        except (KeyError, IndexError) as e:
            error_msg = f"Error parsing Gemini API response: {str(e)}"
            logger.error(f"[{request_id}] {error_msg}")
            logger.error(f"[{request_id}] Response JSON: {json.dumps(result, indent=2)}")
            raise HTTPException(status_code=500, detail=error_msg)
            
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(f"[{request_id}] {error_msg}")
        logger.error(f"[{request_id}] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)

# Add an endpoint to check API key validity
@app.get("/api/check-key")
async def check_api_key():
    try:
        logger.info("Testing Gemini API key validity...")
        # Log the API key being used (masked for security)
        key_info = f"length={len(GEMINI_API_KEY)}, prefix={GEMINI_API_KEY[:4]}..., suffix=...{GEMINI_API_KEY[-4:]}" if GEMINI_API_KEY else "None"
        logger.info(f"Using API key for test: {key_info}")
        
        # Make a simple request to test the API key
        api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GEMINI_API_KEY
        }
        
        logger.info(f"Testing with URL: {api_url}")
        logger.info(f"Headers: {json.dumps({k: '...' if k == 'X-Goog-Api-Key' else v for k, v in headers.items()})}")
        
        response = requests.post(
            api_url,
            headers=headers,
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": "Hello, please respond with OK if you receive this test message."}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 10,
                }
            }
        )
        
        status_code = response.status_code
        logger.info(f"Test request status code: {status_code}")
        
        if status_code == 200:
            return {
                "status": "success",
                "message": "API key is valid",
                "details": {
                    "statusCode": status_code
                }
            }
        else:
            response_text = response.text
            logger.error(f"API key test failed with status {status_code}: {response_text}")
            return {
                "status": "error",
                "message": f"API key test failed with status {status_code}",
                "details": {
                    "statusCode": status_code,
                    "response": response_text
                }
            }
    except Exception as e:
        error_msg = f"Error testing API key: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": error_msg,
            "details": {
                "exception": str(e),
                "traceback": traceback.format_exc()
            }
        }

if __name__ == "__main__":
    logger.info("Starting FastAPI server")
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
