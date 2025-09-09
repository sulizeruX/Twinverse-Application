# Twinverse Application

A full‑stack industrial monitoring application with a React dashboard frontend (served at http://localhost:3000) and a FastAPI backend (default http://localhost:9000). The backend integrates with Google Gemini to provide AI‑assisted insights and summaries for conveyor operations based on live dashboard data.

## Key Features
- AI chat endpoint that turns dashboard metrics into concise, actionable insights.
- Clear API surface with health and key‑verification endpoints.
- Secure environment variable handling with masked logging.
- CORS configured for the local frontend (http://localhost:3000).

## Architecture Overview
- Frontend (React) collects and visualizes facility and conveyor KPIs.
- Backend (FastAPI) exposes:
  - POST /api/chat: Generates an AI response using Google Gemini with provided dashboard data.
  - GET /health: Lightweight liveness probe.
  - GET /api/check-key: Quick Gemini API key validity check.
- External: Google Generative Language API (Gemini 2.0 Flash).

Data flow:
1) Frontend sends { message, dashboardData } to the backend.
2) Backend constructs a structured prompt including:
   - Facility overview (status, last updated).
   - Conveyor counts (total, operational, faulty, nonOperational).
   - Key metrics (production rate, quality, power usage).
   - Optional selected conveyor details (rate, efficiency, quality, uptime, maintenance, temperature, power).
3) Backend calls Gemini and returns a concise text reply.

## Repository Structure (relevant parts)
- backend/
  - main.py — FastAPI app, Gemini integration, logging, endpoints
- README.md — This file
- Frontend (React) — expected to run on port 3000 (not shown in this excerpt)

## Backend Setup
Prerequisites:
- Python 3.10+ recommended
- A Google Generative Language API key (Gemini)

1) Create a virtual environment and install deps
- Windows (PowerShell):
  - cd backend
  - python -m venv .venv
  - .venv\Scripts\Activate.ps1
  - If a requirements.txt exists: pip install -r requirements.txt
  - Otherwise: pip install fastapi "uvicorn[standard]" python-dotenv requests

2) Configure environment variables
- In backend/.env add:
  - GEMINI_API_KEY=your_google_generative_language_api_key

3) Run the server
- From backend directory:
  - python main.py
- The API will be available at http://localhost:9000

Notes:
- Logs are written to api_debug.log and console with sensitive values masked.
- CORS allows http://localhost:3000 by default. Adjust in main.py if your frontend runs elsewhere.

## API Reference
Base URL: http://localhost:9000

- GET /
  - Returns a simple service banner.

- GET /health
  - Liveness check. Example response: { "status": "healthy", "service": "BackendAPI" }

- GET /api/check-key
  - Verifies that GEMINI_API_KEY can call the Gemini endpoint. Useful for debugging credentials.

- POST /api/chat
  - Request body:
    {
      "message": "string",
      "dashboardData": { "...": "any" }
    }
  - Response body:
    {
      "reply": "string"
    }

### Example: POST /api/chat
Request
{
  "message": "Give me a quick health summary.",
  "dashboardData": {
    "dashboard": {
      "facilityStatus": "Operational",
      "lastUpdated": "2025-09-09T12:34:56Z",
      "conveyorCount": { "total": 12, "operational": 10, "faulty": 1, "nonOperational": 1 },
      "metrics": { "totalProductionRate": 420, "averageQuality": 97.5, "totalPowerUsage": 156.8 }
    },
    "conveyor-monitoring": {
      "conveyorId": "A-12",
      "status": "Running",
      "metrics": {
        "production": { "rate": 38.2, "efficiency": 92.1 },
        "quality": { "dimensionalAccuracy": 98.3, "defectRate": 1.1 },
        "equipment": { "uptimePercentage": 99.1, "maintenanceStatus": "OK" },
        "facility": { "temperature": 27.4, "powerUsage": 12.3 }
      }
    }
  }
}

Response
{
  "reply": "Concise AI analysis goes here..."
}

## Troubleshooting
- 401/403 from Gemini: Ensure GEMINI_API_KEY is correct and has access to Generative Language API.
- Empty or error reply: Check api_debug.log for request/response details; ensure request body matches the schema.
- CORS errors in browser: Update allow_origins in main.py to include your frontend URL.

## Security & Logging
- API key is required. The server will raise an error if GEMINI_API_KEY is missing.
- Keys are masked in logs; never commit real keys to version control.

## Extending
- Add new dashboard sections: enrich the prompt construction in /api/chat.
- Multi‑turn chat: maintain a short conversation history and include it in contents.
- Fine‑tune temperature and maxOutputTokens in generationConfig for different tone/length.

## License
Internal/Project use. Add a LICENSE file if you plan to open source.
