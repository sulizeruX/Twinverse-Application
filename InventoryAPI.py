# InventoryAPI.py
# To run this server: pip install fastapi "uvicorn[standard]"
# Then execute: uvicorn InventoryAPI:app --reload

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import uvicorn

app = FastAPI()

# Dictionary to store the running status of each spline
spline_running = {}

# Dictionary to store if the spline should spawn objects
spline_spawning = {}

# Dictionary to track inventory values reported by Unreal Engine
spline_inventory = {}

# No longer needed since we removed reset functionality

class SplineStatus(BaseModel):
    spline_id: str
    running: bool
    
class SplineSpawningStatus(BaseModel):
    spline_id: str
    spawning: bool

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "InventoryAPI"}

# Request inventory for a specific spline
@app.get("/spline/request_inventory/{spline_id}")
def request_inventory(spline_id: str):
    """
    Request the current inventory level for a specific spline from Unreal Engine.
    Returns the tracked inventory value if available, otherwise indicates that it's requesting from Unreal.
    """
    # Initialize the spline status if not exist
    if spline_id not in spline_running:
        spline_running[spline_id] = True
        spline_spawning[spline_id] = True
        print(f"API: Initialized new spline {spline_id}")
    
    # Return the tracked inventory if available
    if spline_id in spline_inventory:
        inventory_value = spline_inventory[spline_id]
        print(f"API: Returning tracked inventory for spline {spline_id}: {inventory_value}")
        return {
            "spline_id": spline_id,
            "inventory": inventory_value,
            "running": spline_running[spline_id],
            "spawning": spline_spawning[spline_id],
            "source": "api_tracking"
        }
    else:
        # Return just the request status if we don't have inventory data yet
        return {
            "spline_id": spline_id,
            "running": spline_running[spline_id],
            "spawning": spline_spawning[spline_id],
            "request": "inventory_request_sent",
            "source": "pending_unreal_data"
        }

# Request the running state of all splines
@app.get("/splines/status")
def get_all_splines_status():
    """
    Get the running and spawning status for all splines.
    """
    return {
        "status": spline_running,
        "spawning": spline_spawning,
        "inventory": spline_inventory
    }

class RestockRequest(BaseModel):
    spline_id: str
    amount: int = 100

# Request to restock a specific spline's inventory
@app.post("/spline/restock_inventory")
def restock_spline_inventory(request: RestockRequest):
    """
    Request to add inventory for a specific spline.
    This will trigger an event in Unreal Engine to add the specified amount to the spline's inventory.
    """
    spline_id = request.spline_id
    amount = request.amount
    
    # ALWAYS initialize with some inventory value if not present
    if spline_id not in spline_inventory:
        spline_inventory[spline_id] = 0
    
    # ALWAYS set basic state variables
    spline_running[spline_id] = True
    
    # Calculate and force new inventory value
    old_value = spline_inventory[spline_id]
    new_value = old_value + amount
    spline_inventory[spline_id] = new_value
    
    # ALWAYS enable spawning when we add inventory
    spline_spawning[spline_id] = True
    
    print(f"⚠️ RESTOCK API: Spline {spline_id}: {old_value} + {amount} = {new_value}")
    print(f"⚠️ RESTOCK API: Spawning set to {spline_spawning[spline_id]}")
    
    return {
        "spline_id": spline_id,
        "old_inventory": old_value,
        "amount_added": amount,
        "new_inventory": new_value,
        "running": spline_running[spline_id],
        "spawning": spline_spawning[spline_id],
        "action": "restock_inventory_forced"
    }

# Note: The set inventory functionality has been removed.
# Use the restock_spline_inventory endpoint to add inventory instead.

# Request to decrement inventory
@app.post("/spline/decrement_inventory/{spline_id}")
def decrement_spline_inventory(spline_id: str, amount: int = 1):
    """
    Request to decrement the inventory for a specific spline.
    This will trigger an event in Unreal Engine to decrement its inventory.
    """
    # Ensure the spline is in our records
    if spline_id not in spline_running:
        spline_running[spline_id] = True
        spline_spawning[spline_id] = True
    
    # Update our tracked inventory if we have it
    if spline_id in spline_inventory:
        current = spline_inventory[spline_id]
        new_value = max(0, current - amount)
        spline_inventory[spline_id] = new_value
        
        # Update spawning state based on new inventory
        if new_value == 0:
            spline_spawning[spline_id] = False
    
    print(f"API: Decrement inventory request for spline {spline_id} by {amount}")
    
    return {
        "spline_id": spline_id,
        "amount": amount,
        "inventory": spline_inventory.get(spline_id, "unknown"),
        "running": spline_running[spline_id],
        "spawning": spline_spawning[spline_id],
        "action": "decrement_inventory_requested"
    }

# Note: The reset all inventory functionality has been removed.
# Use the restock_spline_inventory endpoint to add inventory to specific splines instead.

# Get the running and spawning status of a spline
@app.get("/spline/status/{spline_id}")
def get_spline_status(spline_id: str):
    """
    Check if a spline is running and if it should be spawning objects.
    This endpoint can be polled by Unreal Engine to determine if objects should continue spawning.
    """
    if spline_id not in spline_running:
        spline_running[spline_id] = True
        spline_spawning[spline_id] = True
        print(f"API: Initialized new spline {spline_id}")
    
    # Log status checks less frequently (every 10th check) to avoid flooding logs
    import random
    if random.random() < 0.1:  # 10% chance to log
        print(f"API: Status check for {spline_id}: running={spline_running[spline_id]}, spawning={spline_spawning[spline_id]}, inventory={spline_inventory.get(spline_id, 'unknown')}")
    
    return {
        "spline_id": spline_id,
        "running": spline_running[spline_id],
        "spawning": spline_spawning[spline_id],
        "inventory": spline_inventory.get(spline_id, "unknown")
    }

# Get inventory for all splines
@app.get("/splines/inventory")
def get_all_splines_inventory():
    """
    Get the inventory values for all splines that have reported to the API.
    """
    return {
        "inventory": spline_inventory
    }

# Debug endpoint to help diagnose inventory issues
@app.get("/debug/spline/{spline_id}")
def debug_spline_info(spline_id: str):
    """
    DEBUGGING ENDPOINT: Get detailed information about a specific spline.
    This endpoint has no side effects and just returns what the API knows about the spline.
    """
    is_known = spline_id in spline_running
    is_running = spline_running.get(spline_id, "unknown")
    is_spawning = spline_spawning.get(spline_id, "unknown")
    inventory = spline_inventory.get(spline_id, "unknown")
    
    print(f"DEBUG REQUEST for spline {spline_id}:")
    print(f"  - Known to API: {is_known}")
    print(f"  - Running: {is_running}")
    print(f"  - Spawning: {is_spawning}")
    print(f"  - Inventory: {inventory}")
    
    return {
        "spline_id": spline_id,
        "known_to_api": is_known,
        "running": is_running,
        "spawning": is_spawning,
        "inventory": inventory,
        "all_splines_known": list(spline_running.keys())
    }

# Update the running status of a spline manually
@app.post("/spline/status/update")
def update_spline_status(status: SplineStatus):
    """
    Manually update the running status of a spline.
    """
    spline_id = status.spline_id
    spline_running[spline_id] = status.running
    
    return {
        "spline_id": spline_id,
        "running": spline_running[spline_id],
        "spawning": spline_spawning.get(spline_id, True),
        "message": f"Running status for spline {spline_id} has been set to {status.running}"
    }

# Update the spawning status of a spline manually
@app.post("/spline/spawning/update")
def update_spline_spawning(status: SplineSpawningStatus):
    """
    Manually update whether a spline should be spawning objects.
    """
    spline_id = status.spline_id
    spline_spawning[spline_id] = status.spawning
    
    print(f"API: Spawning status for {spline_id} set to {status.spawning}")
    
    return {
        "spline_id": spline_id,
        "running": spline_running.get(spline_id, True),
        "spawning": spline_spawning[spline_id],
        "message": f"Spawning status for spline {spline_id} has been set to {status.spawning}"
    }

class InventoryReport(BaseModel):
    spline_id: str
    quantity: int

# Report inventory from Unreal Engine back to the API
@app.post("/spline/report_inventory")
def report_spline_inventory(report: InventoryReport):
    """
    Endpoint for Unreal Engine to report its current inventory for a spline.
    This allows the API to track the inventory without being the source of truth.
    """
    spline_id = report.spline_id
    quantity = report.quantity
    
    # Update spawning status based on quantity
    if quantity == 0:
        spline_spawning[spline_id] = False
    else:
        spline_spawning[spline_id] = True
    
    # Track the inventory value reported by Unreal
    spline_inventory[spline_id] = quantity
    
    # Ensure spawning is correctly set based on inventory
    if quantity > 0:
        spline_spawning[spline_id] = True
        
    print(f"API: Received inventory report for spline {spline_id}: quantity={quantity}, spawning={spline_spawning[spline_id]}")
    
    return {
        "spline_id": spline_id,
        "quantity": quantity,
        "running": spline_running.get(spline_id, True),
        "spawning": spline_spawning[spline_id],
        "acknowledged": True
    }

class FullSplineStatus(BaseModel):
    spline_id: str
    quantity: int
    running: bool
    spawning: bool
    
class ForceSetInventoryRequest(BaseModel):
    spline_id: str
    quantity: int = 100
    
# Force set inventory for debugging
@app.post("/spline/force_set_inventory")
def force_set_spline_inventory(request: ForceSetInventoryRequest):
    """
    DEBUG ENDPOINT: Force set the inventory for a specific spline.
    This will both update the API tracking and force Unreal Engine to use this value.
    """
    spline_id = request.spline_id
    quantity = request.quantity
    
    # Ensure the spline is in our records
    if spline_id not in spline_running:
        spline_running[spline_id] = True
        spline_spawning[spline_id] = True
    
    # Force the spawning state to be true if we have inventory
    spline_spawning[spline_id] = quantity > 0
    
    # Force set the inventory in our tracking
    spline_inventory[spline_id] = quantity
    
    print(f"API: FORCE SET inventory for spline {spline_id} to {quantity}, spawning={spline_spawning[spline_id]}")
    
    return {
        "spline_id": spline_id,
        "quantity": quantity,
        "running": spline_running[spline_id],
        "spawning": spline_spawning[spline_id],
        "action": "force_set_inventory"
    }

# Comprehensive status reporting endpoint
@app.post("/spline/report_status")
def report_spline_status(status: FullSplineStatus):
    """
    Comprehensive endpoint for Unreal Engine to report all status information in one call.
    This includes inventory quantity, running state, and spawning state.
    """
    spline_id = status.spline_id
    quantity = status.quantity
    
    # Update our tracked states
    spline_running[spline_id] = status.running
    spline_spawning[spline_id] = status.spawning
    spline_inventory[spline_id] = quantity  # Track the inventory
    
    print(f"API: Full status report for spline {spline_id}: quantity={quantity}, running={status.running}, spawning={status.spawning}")
    
    return {
        "spline_id": spline_id,
        "quantity": quantity,
        "running": spline_running[spline_id],
        "spawning": spline_spawning[spline_id],
        "acknowledged": True
    }

if __name__ == "__main__":
    import sys
    import os
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Add the directory to the Python path if not already there
    if script_dir not in sys.path:
        sys.path.append(script_dir)
    
    # Run with reload enabled
    uvicorn.run("InventoryAPI:app", host="0.0.0.0", port=8002, reload=True)  # Using port 8002 to avoid conflict with MoveableAPI
