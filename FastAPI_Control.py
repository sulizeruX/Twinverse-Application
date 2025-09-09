# main.pfrom typing import Dict, Optional, List

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list methods
    allow_headers=["Content-Type", "Authorization", "Accept"],  # Explicitly list headers
    expose_headers=["Content-Length"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# No external dependencies needed for this exampleserver: pip install fastapi "uvicorn[standard]"
# Then execute: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from typing import Dict, Optional, List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list methods
    allow_headers=["Content-Type", "Authorization", "Accept"],  # Explicitly list headers
    expose_headers=["Content-Length"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Dummy function to simulate Unreal communication
import requests

# Global state to store pause status for all splines
global_pause_state = False
# Dictionary to store individual spline pause states
spline_pause_states: Dict[str, bool] = {}
# List to track all spline IDs in the system
known_spline_ids: List[str] = []

class SplinePauseRequest(BaseModel):
    spline_id: str
    paused: bool

@app.post("/pause/")
async def pause_all_conveyors(paused: bool):
    """
    Update the pause state for all conveyors that will be checked by Unreal Engine.
    This will override individual spline pause states.
    """
    global global_pause_state
    global_pause_state = paused
    
    # When we globally pause or unpause, don't modify the individual spline states
    # They'll still be in effect when global pause is turned off
    
    return {"paused": paused, "status": "ok", "message": "Global pause state updated"}

@app.post("/pause_spline/")
async def pause_specific_spline(request: SplinePauseRequest):
    """
    Update the pause state for a specific spline identified by spline_id.
    This won't affect the global pause state.
    """
    global spline_pause_states, known_spline_ids
    
    # Validate the spline ID
    if not request.spline_id or request.spline_id.strip() == "":
        raise HTTPException(status_code=400, detail="Invalid spline_id: must not be empty")
    
    # Store the pause state for this specific spline
    spline_pause_states[request.spline_id] = request.paused
    
    # Track this spline ID if it's new
    if request.spline_id not in known_spline_ids:
        known_spline_ids.append(request.spline_id)
        
    return {
        "spline_id": request.spline_id, 
        "paused": request.paused, 
        "status": "ok",
        "message": f"Spline {request.spline_id} pause state updated to {request.paused}"
    }

@app.get("/check_pause_state")
async def check_pause_state():
    """
    Endpoint for Unreal Engine to check the current global pause state.
    """
    return {"paused": global_pause_state}

@app.get("/check_spline_pause_state/{spline_id}")
async def check_spline_pause_state(spline_id: str):
    """
    Endpoint for Unreal Engine to check the pause state of a specific spline.
    If global_pause_state is True, this will also return True regardless of the individual spline state.
    """
    # Validate the spline ID
    if not spline_id or spline_id.strip() == "":
        raise HTTPException(status_code=400, detail="Invalid spline_id: must not be empty")
    
    # Get the spline-specific pause state
    spline_paused = spline_pause_states.get(spline_id, False)
    
    # If global pause is on, all splines should be paused
    if global_pause_state:
        return {
            "spline_id": spline_id, 
            "paused": True, 
            "global_override": True,
            "spline_paused": spline_paused,
            "global_paused": global_pause_state
        }
    
    # Otherwise return the individual spline state
    return {
        "spline_id": spline_id, 
        "paused": spline_paused, 
        "global_override": False,
        "spline_paused": spline_paused,
        "global_paused": global_pause_state
    }

@app.get("/splines")
async def get_all_splines():
    """
    Get a list of all known spline IDs and their pause states.
    """
    result = {
        "global_pause": global_pause_state,
        "splines": {spline_id: spline_pause_states.get(spline_id, False) for spline_id in known_spline_ids}
    }
    return result

@app.get("/speed/{speed_value}")
async def read_speed(speed_value: int):
    """
    A GET endpoint that accepts an integer 'speed_value' in the URL path.
    The value is automatically converted to an integer by FastAPI.
    """
    if not (0 <= speed_value <= 200):
        raise HTTPException(status_code=400, detail="Speed must be between 0 and 200")
    
    return {"message": f"Received speed value: {speed_value}", "status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
