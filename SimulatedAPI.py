from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import random
from datetime import datetime
from pydantic import BaseModel
import asyncio
from typing import Dict, Any, Optional
from time import time

# ============================================================
#  Industrial Facility Monitoring API - Optimized Version
#  - KPI-specific update cadences (e.g., temp every 30s, humidity every 10m)
#  - Lazy stateful updates (only refresh when due, otherwise reuse last value)
#  - Runtime-configurable KPI rules via /kpi-rules endpoint
#  - Backwards-compatible routes
# ============================================================

app = FastAPI(
    title="Industrial Facility Monitoring API - 5 Conveyor Belt System (Optimized)",
    description="""
    This API simulates a factory environment with 5 conveyor belts:
    
    - Conveyor belts 1-3 are fully operational
    - Conveyor belt 4 is faulty (producing abnormal/extreme values)
    - Conveyor belt 5 is non-operational (all values are zero)
    
    KPIs are updated on independent cadences for realism (e.g., temperature 30s, humidity 10m).
    """
)

# Configure CORS - Allow all origins for development (update for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# Global state
# ------------------------------------------------------------
paused: bool = False  # simulation paused flag

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

# ------------------------------------------------------------
# KPI Update Rules (seconds)
# - Keys are (category -> field -> interval_seconds)
# - You can modify at runtime via /kpi-rules
# ------------------------------------------------------------
UPDATE_RULES: Dict[str, Dict[str, int]] = {
    "overall_facility": {
        "temperature": 30,              # every 30 seconds
        "humidity": 600,                # every 10 minutes
        "warnings_notifications": 1200, # every 20 minutes
        "personal_data": 8 * 60 * 60,   # every 8 hours
        # Add more fields as needed
    },
    # Examples for future:
    # "production_data": {"production_rate": 60},
    # "equipment_performance": {"uptime_downtime": 300},
}

# ------------------------------------------------------------
# In-memory KPI STATE
# STATE[conveyor_id][category][field] = {"value": <any>, "t": <epoch_seconds>}
# ------------------------------------------------------------
STATE: Dict[int, Dict[str, Dict[str, Dict[str, Any]]]] = {}

def _get_state(conveyor_id: int, category: str, field: str, default: Any = None) -> Dict[str, Any]:
    return STATE.setdefault(conveyor_id, {}).setdefault(category, {}).setdefault(field, {"value": default, "t": 0.0})

def _get_interval(category: str, field: str) -> Optional[int]:
    return UPDATE_RULES.get(category, {}).get(field)

def _should_update(conveyor_id: int, category: str, field: str) -> bool:
    interval = _get_interval(category, field)
    if interval is None:
        # If no rule defined, update every call (legacy behavior)
        return True
    node = _get_state(conveyor_id, category, field)
    return (time() - float(node["t"])) >= interval

def _set_state(conveyor_id: int, category: str, field: str, value: Any) -> Any:
    node = _get_state(conveyor_id, category, field)
    node["value"] = value
    node["t"] = time()
    return value

def _get_value(conveyor_id: int, category: str, field: str) -> Any:
    return _get_state(conveyor_id, category, field)["value"]

# ------------------------------------------------------------
# Utility: determine conveyor status string
# ------------------------------------------------------------
def _conveyor_status(conveyor_id: int) -> str:
    if conveyor_id == 5:
        return "non-operational"
    if conveyor_id == 4:
        return "faulty"
    return "operational"

# ------------------------------------------------------------
# Generators with lazy/timed updates
# ------------------------------------------------------------
def _gen_overall_temperature(conveyor_id: int, status: str) -> float:
    if status == "non-operational":
        low, high = 0, 0
    elif status == "faulty":
        low, high = 30, 45
    else:
        low, high = 20, 26
    prev = _get_value(conveyor_id, "overall_facility", "temperature")
    if prev is None:
        newv = round(random.uniform(low, high), 1)
    else:
        drift = random.uniform(-0.4, 0.4)
        newv = round(min(max(prev + drift, low), high), 1)
    return newv

def _gen_overall_humidity(conveyor_id: int, status: str) -> float:
    if status == "non-operational":
        low, high = 0, 0
    elif status == "faulty":
        low, high = 75, 95
    else:
        low, high = 40, 60
    prev = _get_value(conveyor_id, "overall_facility", "humidity")
    if prev is None:
        base = round(random.uniform(low, high), 1)
    else:
        base = prev + random.uniform(-1.0, 1.0)
    return round(min(max(base, low), high), 1)

def _gen_overall_warnings(conveyor_id: int, status: str) -> int:
    if status == "non-operational":
        return 0
    elif status == "faulty":
        return random.randint(5, 10)
    else:
        return random.randint(0, 3)

def _gen_overall_personal(conveyor_id: int, status: str) -> Dict[str, Any]:
    if status == "non-operational":
        return {"personnel_present": 0, "shift_efficiency": 0, "safety_incidents": 0}
    elif status == "faulty":
        return {
            "personnel_present": random.randint(2, 5),
            "shift_efficiency": round(random.uniform(40, 65), 1),
            "safety_incidents": random.randint(1, 3)
        }
    else:
        return {
            "personnel_present": random.randint(10, 50),
            "shift_efficiency": round(random.uniform(80, 95), 1),
            "safety_incidents": random.randint(0, 1)
        }

def simulate_overall_facility_data(conveyor_id: int) -> Dict[str, Any]:
    status = _conveyor_status(conveyor_id)

    # temperature (30s cadence)
    if _should_update(conveyor_id, "overall_facility", "temperature"):
        _set_state(conveyor_id, "overall_facility", "temperature", _gen_overall_temperature(conveyor_id, status))
    temperature = _get_value(conveyor_id, "overall_facility", "temperature")

    # humidity (10m cadence)
    if _should_update(conveyor_id, "overall_facility", "humidity"):
        _set_state(conveyor_id, "overall_facility", "humidity", _gen_overall_humidity(conveyor_id, status))
    humidity = _get_value(conveyor_id, "overall_facility", "humidity")

    # warnings (20m cadence)
    if _should_update(conveyor_id, "overall_facility", "warnings_notifications"):
        _set_state(conveyor_id, "overall_facility", "warnings_notifications", _gen_overall_warnings(conveyor_id, status))
    warnings_notifications = _get_value(conveyor_id, "overall_facility", "warnings_notifications")

    # personal data (8h cadence)
    if _should_update(conveyor_id, "overall_facility", "personal_data"):
        _set_state(conveyor_id, "overall_facility", "personal_data", _gen_overall_personal(conveyor_id, status))
    personal_data = _get_value(conveyor_id, "overall_facility", "personal_data")

    # Legacy behavior for the rest (you can add cadences later).
    if status == "non-operational":
        air_quality = 0
        power_usage = {"current_kw": 0, "daily_usage": 0, "efficiency_rating": 0}
        co2_emissions = {"current_level": 0, "daily_average": 0, "target_compliance": 0}
    elif status == "faulty":
        air_quality = round(random.uniform(60, 75), 1)
        power_usage = {
            "current_kw": round(random.uniform(2500, 4000), 2),
            "daily_usage": round(random.uniform(45000, 60000), 2),
            "efficiency_rating": round(random.uniform(40, 65), 1),
        }
        co2_emissions = {
            "current_level": round(random.uniform(1500, 2500), 2),
            "daily_average": round(random.uniform(1200, 2000), 2),
            "target_compliance": round(random.uniform(40, 70), 1),
        }
    else:
        air_quality = round(random.uniform(85, 99), 1)
        power_usage = {
            "current_kw": round(random.uniform(500, 2000), 2),
            "daily_usage": round(random.uniform(10000, 40000), 2),
            "efficiency_rating": round(random.uniform(75, 90), 1),
        }
        co2_emissions = {
            "current_level": round(random.uniform(400, 1200), 2),
            "daily_average": round(random.uniform(500, 900), 2),
            "target_compliance": round(random.uniform(85, 99), 1),
        }

    return {
        "temperature": temperature,
        "humidity": humidity,
        "air_quality": air_quality,
        "warnings_notifications": warnings_notifications,
        "personal_data": personal_data,
        "power_usage": power_usage,
        "co2_emissions": co2_emissions,
    }

# ------------------------------------------------------------
# Other categories (legacy behavior; add cadences later if desired)
# ------------------------------------------------------------
def simulate_production_data(conveyor_id: int) -> Dict[str, Any]:
    status = _conveyor_status(conveyor_id)
    if status == "non-operational":
        return {
            "quality": {"first_pass_yield": 0, "defect_rate": 0, "scrap_rate": 0},
            "time_per_hour": {"units_produced": 0, "cycle_time": 0, "efficiency": 0},
            "product_management": {"active_orders": 0, "backlog": 0, "on_time_delivery": 0, "inventory_levels": 0},
            "production_rate": {"current_rate": 0, "target_rate": 0, "variance": 0},
        }
    elif status == "faulty":
        return {
            "quality": {
                "first_pass_yield": round(random.uniform(50, 70), 1),
                "defect_rate": round(random.uniform(15, 30), 2),
                "scrap_rate": round(random.uniform(10, 20), 2),
            },
            "time_per_hour": {
                "units_produced": random.randint(10, 40),
                "cycle_time": round(random.uniform(80, 180), 2),
                "efficiency": round(random.uniform(30, 60), 1),
            },
            "product_management": {
                "active_orders": random.randint(1, 5),
                "backlog": random.randint(15, 30),
                "on_time_delivery": round(random.uniform(30, 60), 1),
                "inventory_levels": round(random.uniform(20, 40), 1),
            },
            "production_rate": {
                "current_rate": random.randint(20, 50),
                "target_rate": random.randint(100, 160),
                "variance": round(random.uniform(-70, -40), 1),
            },
        }
    else:
        return {
            "quality": {
                "first_pass_yield": round(random.uniform(85, 99.5), 1),
                "defect_rate": round(random.uniform(0.1, 5), 2),
                "scrap_rate": round(random.uniform(0.2, 3), 2),
            },
            "time_per_hour": {
                "units_produced": random.randint(50, 200),
                "cycle_time": round(random.uniform(15, 60), 2),
                "efficiency": round(random.uniform(75, 98), 1),
            },
            "product_management": {
                "active_orders": random.randint(3, 15),
                "backlog": random.randint(0, 10),
                "on_time_delivery": round(random.uniform(80, 99), 1),
                "inventory_levels": round(random.uniform(70, 95), 1),
            },
            "production_rate": {
                "current_rate": random.randint(80, 150),
                "target_rate": random.randint(100, 160),
                "variance": round(random.uniform(-15, 10), 1),
            },
        }

def simulate_quality_control_data(conveyor_id: int) -> Dict[str, Any]:
    status = _conveyor_status(conveyor_id)
    if status == "non-operational":
        return {
            "defective_products": {"count": 0, "percentage": 0, "critical_defects": 0},
            "areas_of_improvement": {"identified_areas": 0, "priority_level": "none", "estimated_impact": 0},
            "defects_rates": {"by_category": {"assembly": 0, "material": 0, "finish": 0, "packaging": 0}, "trend": "none", "within_targets": False},
            "quality_metrics": {"dimensional_accuracy": 0, "visual_inspection_pass_rate": 0, "customer_return_rate": 0},
        }
    elif status == "faulty":
        return {
            "defective_products": {"count": random.randint(40, 80), "percentage": round(random.uniform(15, 30), 2), "critical_defects": random.randint(10, 25)},
            "areas_of_improvement": {"identified_areas": random.randint(8, 15), "priority_level": "high", "estimated_impact": round(random.uniform(7, 10), 1)},
            "defects_rates": {
                "by_category": {
                    "assembly": round(random.uniform(10, 20), 2),
                    "material": round(random.uniform(5, 15), 2),
                    "finish": round(random.uniform(8, 18), 2),
                    "packaging": round(random.uniform(3, 8), 2),
                },
                "trend": "worsening",
                "within_targets": False,
            },
            "quality_metrics": {"dimensional_accuracy": round(random.uniform(70, 85), 2), "visual_inspection_pass_rate": round(random.uniform(60, 80), 1), "customer_return_rate": round(random.uniform(5, 15), 2)},
        }
    else:
        return {
            "defective_products": {"count": random.randint(0, 20), "percentage": round(random.uniform(0.1, 3), 2), "critical_defects": random.randint(0, 5)},
            "areas_of_improvement": {"identified_areas": random.randint(1, 5), "priority_level": random.choice(["low", "medium", "high"]), "estimated_impact": round(random.uniform(1, 10), 1)},
            "defects_rates": {
                "by_category": {
                    "assembly": round(random.uniform(0.1, 2), 2),
                    "material": round(random.uniform(0.05, 1.5), 2),
                    "finish": round(random.uniform(0.2, 2.5), 2),
                    "packaging": round(random.uniform(0.1, 1), 2),
                },
                "trend": random.choice(["improving", "stable", "worsening"]),
                "within_targets": random.choice([True, True, True, False]),
            },
            "quality_metrics": {"dimensional_accuracy": round(random.uniform(95, 99.9), 2), "visual_inspection_pass_rate": round(random.uniform(90, 99), 1), "customer_return_rate": round(random.uniform(0.01, 1), 2)},
        }

def simulate_equipment_performance_data(conveyor_id: int) -> Dict[str, Any]:
    status = _conveyor_status(conveyor_id)
    if status == "non-operational":
        return {
            "uptime_downtime": {"uptime_percentage": 0, "planned_downtime": 24, "unplanned_downtime": 0, "mean_time_between_failures": 0},
            "operating_conditions": {"temperature": 0, "pressure": 0, "vibration": 0, "noise_level": 0, "load_percentage": 0},
            "time_per_hour": {"processing_time": 0, "idle_time": 60, "setup_time": 0, "maintenance_time": 0},
            "parameters": {"temp_pressure_vibration": {"temperature": 0, "pressure": 0, "vibration": 0, "within_spec": False}},
        }
    elif status == "faulty":
        return {
            "uptime_downtime": {
                "uptime_percentage": round(random.uniform(30, 60), 1),
                "planned_downtime": round(random.uniform(3, 6), 1),
                "unplanned_downtime": round(random.uniform(4, 12), 2),
                "mean_time_between_failures": round(random.uniform(10, 60), 1),
            },
            "operating_conditions": {
                "temperature": round(random.uniform(45, 65), 1),
                "pressure": round(random.uniform(40, 70), 1),
                "vibration": round(random.uniform(5, 15), 2),
                "noise_level": round(random.uniform(95, 110), 1),
                "load_percentage": round(random.uniform(30, 50), 1),
            },
            "time_per_hour": {
                "processing_time": round(random.uniform(20, 35), 1),
                "idle_time": round(random.uniform(15, 25), 1),
                "setup_time": round(random.uniform(10, 20), 1),
                "maintenance_time": round(random.uniform(5, 15), 1),
            },
            "parameters": {"temp_pressure_vibration": {"temperature": round(random.uniform(45, 65), 1), "pressure": round(random.uniform(40, 70), 1), "vibration": round(random.uniform(5, 15), 2), "within_spec": False}},
        }
    else:
        return {
            "uptime_downtime": {
                "uptime_percentage": round(random.uniform(85, 99), 1),
                "planned_downtime": round(random.uniform(1, 8), 1),
                "unplanned_downtime": round(random.uniform(0, 4), 2),
                "mean_time_between_failures": round(random.uniform(100, 500), 1),
            },
            "operating_conditions": {
                "temperature": round(random.uniform(20, 40), 1),
                "pressure": round(random.uniform(80, 110), 1),
                "vibration": round(random.uniform(0.1, 2.5), 2),
                "noise_level": round(random.uniform(60, 95), 1),
                "load_percentage": round(random.uniform(60, 90), 1),
            },
            "time_per_hour": {
                "processing_time": round(random.uniform(45, 58), 1),
                "idle_time": round(random.uniform(0, 10), 1),
                "setup_time": round(random.uniform(2, 8), 1),
                "maintenance_time": round(random.uniform(0, 5), 1),
            },
            "parameters": {"temp_pressure_vibration": {"temperature": round(random.uniform(20, 40), 1), "pressure": round(random.uniform(80, 110), 1), "vibration": round(random.uniform(0.1, 2.5), 2), "within_spec": random.choice([True, True, True, False])}},
        }

def simulate_equipment_perf_data(conveyor_id: int) -> Dict[str, Any]:
    equipment = ["Conveyor Line", "CNC Machine", "Laser Cutter", "Injection Molder", "Robot Arm"]
    status = _conveyor_status(conveyor_id)
    equipment_data = {}
    if status == "non-operational":
        for item in equipment:
            equipment_data[item] = {"usage_hours": 0, "performance_score": 0, "wear_percentage": 0, "maintenance_needed": False, "downtime": 24}
    elif status == "faulty":
        for item in equipment:
            equipment_data[item] = {"usage_hours": round(random.uniform(5, 10), 1), "performance_score": round(random.uniform(20, 50), 1), "wear_percentage": round(random.uniform(60, 95), 1), "maintenance_needed": True, "downtime": round(random.uniform(5, 15), 2)}
    else:
        for item in equipment:
            equipment_data[item] = {"usage_hours": round(random.uniform(0, 24), 1), "performance_score": round(random.uniform(70, 100), 1), "wear_percentage": round(random.uniform(0, 80), 1), "maintenance_needed": random.random() > 0.8, "downtime": round(random.uniform(0, 2), 2)}
    return equipment_data

# ------------------------------------------------------------
# Snapshot builders (use lazy/timed KPI updates)
# ------------------------------------------------------------
def get_conveyor_snapshot(conveyor_id: int) -> Dict[str, Any]:
    status = _conveyor_status(conveyor_id)
    return {
        "conveyor_id": conveyor_id,
        "status": status,
        "overall_facility": simulate_overall_facility_data(conveyor_id),
        "production_data": simulate_production_data(conveyor_id),
        "equipment_performance": simulate_equipment_performance_data(conveyor_id),
        "quality_control": simulate_quality_control_data(conveyor_id),
        "equipment_details": simulate_equipment_perf_data(conveyor_id),
    }

def get_all_facility_data() -> Dict[str, Any]:
    conveyor_data = {f"conveyor_{cid}": get_conveyor_snapshot(cid) for cid in range(1, 6)}
    return {"timestamp": datetime.now().isoformat(), "facility_status": "operational", "simulation_paused": paused, "conveyor_belts": conveyor_data}

# ------------------------------------------------------------
# API Models
# ------------------------------------------------------------
class CategoryRequest(BaseModel):
    category_name: str

class DataRequest(BaseModel):
    data_name: str

class EquipmentRequest(BaseModel):
    equipment_name: str

class RulesPatch(BaseModel):
    category: str
    field: str
    interval_seconds: int

# ------------------------------------------------------------
# Routes
# ------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SimulatedAPI"}

@app.get("/")
def read_root():
    return {"message": "Industrial Facility Monitoring API - Optimized"}

@app.get("/data")
def get_data():
    return get_all_facility_data()

@app.get("/conveyor/{conveyor_id}")
def get_conveyor_data(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    facility_data = get_all_facility_data()
    conveyor = facility_data["conveyor_belts"].get(f"conveyor_{conveyor_id}")
    if not conveyor:
        raise HTTPException(status_code=404, detail=f"Conveyor {conveyor_id} not found")
    return {"timestamp": facility_data["timestamp"], "conveyor_id": conveyor_id, "data": conveyor}

@app.post("/category/{conveyor_id}")
def get_category_data(conveyor_id: int, request: CategoryRequest):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    valid_categories = ["overall_facility", "production_data", "equipment_performance", "quality_control", "equipment_details"]
    if request.category_name not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Category name must be one of: {', '.join(valid_categories)}")
    snapshot = get_conveyor_snapshot(conveyor_id)
    category_data = snapshot.get(request.category_name)
    if category_data is None:
        raise HTTPException(status_code=404, detail=f"Category {request.category_name} not found for conveyor {conveyor_id}")
    return {"timestamp": datetime.now().isoformat(), "conveyor_id": conveyor_id, "category": request.category_name, "data": category_data}

@app.get("/conveyor/{conveyor_id}/overall")
def get_conveyor_overall(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    return simulate_overall_facility_data(conveyor_id)

@app.get("/conveyor/{conveyor_id}/production")
def get_conveyor_production(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    return simulate_production_data(conveyor_id)

@app.get("/conveyor/{conveyor_id}/equipment")
def get_conveyor_equipment(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    return simulate_equipment_performance_data(conveyor_id)

@app.get("/conveyor/{conveyor_id}/quality")
def get_conveyor_quality(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    return simulate_quality_control_data(conveyor_id)

@app.get("/conveyor/{conveyor_id}/equipment-details")
def get_conveyor_equipment_details(conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        raise HTTPException(status_code=404, detail="Conveyor ID must be between 1 and 5")
    return simulate_equipment_perf_data(conveyor_id)

# ---- Simulation status ----
@app.post("/simulate/status/")
def update_simulation_status(active: bool):
    global paused
    paused = not active
    return {"simulation_active": active, "paused": paused, "status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/simulate/status/")
def check_simulation_status():
    return {"simulation_active": not paused, "paused": paused, "timestamp": datetime.now().isoformat()}

# ---- KPI Rules admin ----
@app.get("/kpi-rules")
def get_kpi_rules():
    return UPDATE_RULES

@app.patch("/kpi-rules")
def patch_kpi_rule(patch: RulesPatch):
    cat = patch.category
    field = patch.field
    if patch.interval_seconds < 0:
        raise HTTPException(status_code=400, detail="interval_seconds must be >= 0")
    if cat not in UPDATE_RULES:
        UPDATE_RULES[cat] = {}
    UPDATE_RULES[cat][field] = int(patch.interval_seconds)
    # Reset timestamps so changes take effect immediately on next access
    for cid in range(1, 6):
        if cid in STATE and cat in STATE[cid] and field in STATE[cid][cat]:
            STATE[cid][cat][field]["t"] = 0.0
    return {"ok": True, "updated": {cat: {field: UPDATE_RULES[cat][field]}}}

# ------------------------------------------------------------
# WebSockets - publish snapshots every 5s; only due KPIs will change.
# ------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.send_json(get_all_facility_data())
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/conveyor/{conveyor_id}")
async def websocket_conveyor_endpoint(websocket: WebSocket, conveyor_id: int):
    if not 1 <= conveyor_id <= 5:
        await websocket.close(code=1008, reason="Invalid conveyor ID. Must be between 1 and 5")
        return
    await manager.connect(websocket)
    try:
        while True:
            facility_data = get_all_facility_data()
            conveyor_data = facility_data["conveyor_belts"].get(f"conveyor_{conveyor_id}")
            response = {"timestamp": facility_data["timestamp"], "conveyor_id": conveyor_id, "data": conveyor_data}
            await websocket.send_json(response)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/conveyor/{conveyor_id}/category/{category_name}")
async def websocket_category_endpoint(websocket: WebSocket, conveyor_id: int, category_name: str):
    valid_categories = ["overall_facility", "production_data", "equipment_performance", "quality_control", "equipment_details"]
    if not 1 <= conveyor_id <= 5:
        await websocket.close(code=1008, reason="Invalid conveyor ID. Must be between 1 and 5")
        return
    if category_name not in valid_categories:
        await websocket.close(code=1008, reason=f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return
    await manager.connect(websocket)
    try:
        while True:
            snapshot = get_conveyor_snapshot(conveyor_id)
            response = {"timestamp": datetime.now().isoformat(), "conveyor_id": conveyor_id, "category_name": category_name, "data": snapshot.get(category_name)}
            await websocket.send_json(response)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ------------------------------------------------------------
# Helper: get local IPs for convenience in __main__
# ------------------------------------------------------------
def get_local_ip_addresses():
    import socket
    ips = []
    try:
        hostname = socket.gethostname()
        ip_list = socket.gethostbyname_ex(hostname)[2]
        for ip in ip_list:
            if ip != '127.0.0.1' and ':' not in ip:
                ips.append(ip)
    except Exception as e:
        print(f"Error getting IP addresses: {e}")
    return ips

if __name__ == "__main__":
    port = 8007  # changed from 8006 to avoid conflict with running server
    local_ips = get_local_ip_addresses()

    print("\n" + "="*70)
    print(" 🏭 INDUSTRIAL FACILITY MONITORING API SERVER - OPTIMIZED ")
    print("="*70)
    print(" Conveyor Belt Status:")
    print("  • Conveyor belts 1-3: Normal operation")
    print("  • Conveyor belt 4: Faulty operation (abnormal metrics)")
    print("  • Conveyor belt 5: Non-operational (zero metrics)")
    print("\n Server is starting up. Connect using one of these URLs:")
    print(f"  • Local:   http://localhost:{port}")
    
    if local_ips:
        for ip in local_ips:
            print(f"  • Network: http://{ip}:{port}")
        print("\n For React integration:")
        print(f"  • Base URL:                     http://{local_ips[0]}:{port}")
        print(f"  • All facility data:            http://{local_ips[0]}:{port}/data")
        print(f"  • Specific conveyor data:       http://{local_ips[0]}:{port}/conveyor/1")
        print(f"  • Conveyor category data:       http://{local_ips[0]}:{port}/category/1 (POST with category_name)")
        print(f"  • Conveyor overall facility:    http://{local_ips[0]}:{port}/conveyor/1/overall")
        print(f"  • Conveyor production data:     http://{local_ips[0]}:{port}/conveyor/1/production")
        print(f"  • Conveyor equipment data:      http://{local_ips[0]}:{port}/conveyor/1/equipment")
        print(f"  • Conveyor quality data:        http://{local_ips[0]}:{port}/conveyor/1/quality")
        print(f"  • Conveyor equipment details:   http://{local_ips[0]}:{port}/conveyor/1/equipment-details")
        print("\n WebSocket connections:")
        print(f"  • All data:                     ws://{local_ips[0]}:{port}/ws")
        print(f"  • Specific conveyor data:       ws://{local_ips[0]}:{port}/ws/conveyor/1")
        print(f"  • Conveyor category data:       ws://{local_ips[0]}:{port}/ws/conveyor/1/category/production_data")
    else:
        print("  • No network IPs detected. Check your network connection.")
    
    print(f"\n API documentation available at: http://localhost:{port}/docs")
    print("="*70 + "\n")

    # IMPORTANT: Module name must match this filename without .py
    uvicorn.run("SimulatedAPI:app", host="0.0.0.0", port=port)
