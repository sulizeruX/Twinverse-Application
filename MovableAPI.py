# main.py
# To run this server: pip install fastapi "uvicorn[standard]"
# Then execute: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Dict, Optional, List

app = FastAPI()

# Proper CORS configuration for React and external C++ access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
    spline_id: str
    paused: bool

@app.post("/pause/")
def pause_all_conveyors(paused: bool):
    """
    Update the pause state for all conveyors that will be checked by Unreal Engine.
    This will override individual spline pause states.
    """
    global global_pause_state
    global_pause_state = paused
    
    # When we globally pause or unpause, don't modify the individual spline states
    # They'll still be in effect when global pause is turned off
    
    print(f"API: Global pause state set to {paused} (True=PAUSED, False=RUNNING)")
    
    return {"paused": paused, "status": "ok", "message": f"Global pause state updated to {paused} (True=PAUSED, False=RUNNING)"}

@app.post("/pause_spline/")
def pause_specific_spline(request: SplinePauseRequest):
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
    
    print(f"API: Spline {request.spline_id} pause state set to {request.paused} (True=PAUSED, False=RUNNING)")
        
    return {
        "spline_id": request.spline_id, 
        "paused": request.paused, 
        "status": "ok",
        "message": f"Spline {request.spline_id} pause state updated to {request.paused} (True=PAUSED, False=RUNNING)"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MovableAPI"}

@app.get("/check_pause_state")
def check_pause_state():
    """
    Endpoint for Unreal Engine to check the current global pause state.
    """
    print(f"API: Unreal Engine checking global pause state, current value: {global_pause_state} (True=PAUSED, False=RUNNING)")
    return {"paused": global_pause_state, "message": f"Global pause state is {global_pause_state} (True=PAUSED, False=RUNNING)"}

@app.get("/check_spline_pause_state/{spline_id}")
def check_spline_pause_state(spline_id: str):
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
    paused_result = global_pause_state or spline_paused
    print(f"API: Checking pause state for spline {spline_id}: global={global_pause_state}, spline={spline_paused}, result={paused_result} (True=PAUSED, False=RUNNING)")
    
    if global_pause_state:
        return {
            "spline_id": spline_id, 
            "paused": True, 
            "global_override": True,
            "spline_paused": spline_paused,
            "global_paused": global_pause_state,
            "message": f"Spline {spline_id} is PAUSED due to global override (Global={global_pause_state}, Spline={spline_paused})"
        }
    
    # Otherwise return the individual spline state
    return {
        "spline_id": spline_id, 
        "paused": spline_paused, 
        "global_override": False,
        "spline_paused": spline_paused,
        "global_paused": global_pause_state,
        "message": f"Spline {spline_id} is {('PAUSED' if spline_paused else 'RUNNING')} (Global={global_pause_state}, Spline={spline_paused})"
    }

@app.get("/splines")
def get_all_splines():
    """
    Get a list of all known spline IDs and their pause states.
    """
    result = {
        "global_pause": global_pause_state,
        "splines": {spline_id: spline_pause_states.get(spline_id, False) for spline_id in known_spline_ids}
    }
    return result

# React-specific endpoints
@app.post("/react/pause")
def react_pause_all_conveyors(paused: bool):
    """
    React-specific endpoint for controlling pause state.
    """
    global global_pause_state
    global_pause_state = paused
    print(f"API: React set global pause state to {paused}")
    return {"paused": paused, "status": "ok", "for": "react"}

@app.get("/react/state")
def react_get_state():
    """
    React-specific endpoint for getting pause state.
    """
    return {
        "paused": global_pause_state,
        "splines": {spline_id: spline_pause_states.get(spline_id, False) for spline_id in known_spline_ids},
        "for": "react"
    }

# # Define a Pydantic model for the data we expect in a POST request.
# class Item(BaseModel):
#     name: str
#     price: float
#     is_offer: bool | None = None
#     speed: int | None = None # Added a speed variable

# @app.get("/")
# def read_root():
#     """A simple GET endpoint."""
#     return {"message": "Hello, World!"}

@app.get("/speed/{speed_value}")
def read_speed(speed_value: int):
    """
    A GET endpoint that accepts an integer 'speed_value' in the URL path.
    The value is automatically converted to an integer by FastAPI.
    """
    if not (0 <= speed_value <= 200):
        raise HTTPException(status_code=400, detail="Speed must be between 0 and 200")
    
    return {"message": f"Received speed value: {speed_value}", "status": "ok"}

@app.get("/health")
def health_check():
    """
    Simple health check endpoint to verify the API is running.
    """
    return {
        "status": "ok", 
        "message": "MovableAPI is running", 
        "global_pause_state": global_pause_state,
        "spline_states_count": len(spline_pause_states),
        "known_splines": len(known_spline_ids)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)