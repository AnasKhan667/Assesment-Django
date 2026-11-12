# FuelRoute Optimizer — Spotter Backend Assessment

Cost-effective fuel stop planner for long-haul trucking across the United States. Built with Django REST Framework, OpenRouteService API, and a React + Leaflet visual frontend.

---

## 🏗️ Architecture & Project Structure

The project is cleanly decoupled into two standalone directories:

```
django-assesment/
├── Backend/                    # Backend (Django 6.1 + DRF)
│   ├── apps/
│   │   ├── fuel/               # Truck stop models, importer, offline geocoding, optimizer
│   │   │   ├── management/commands/import_fuel_data.py
│   │   │   ├── models.py
│   │   │   ├── services/
│   │   │   │   ├── geocoder.py # Fast offline city/state geocoding via pgeocode
│   │   │   │   └── optimizer.py# Greedy look-ahead cost-minimizing algorithm
│   │   │   └── tests/
│   │   └── routes/             # Routing API, serializers, views
│   │       ├── services/routing.py  # OpenRouteService integration
│   │       ├── serializers.py
│   │       ├── views.py        # POST /api/v1/routes/plan/
│   │       └── tests/
│   ├── config/                 # Django settings, WSGI, URLs
│   ├── data/                   # OPIS fuel prices CSV (8,152 rows)
│   ├── db.sqlite3              # Pre-seeded database with 6,738 truck stops
│   ├── requirements.txt        # Production backend dependencies
│   ├── manage.py
│   └── .env.example
├── Frontend/                   # Frontend (React 19 + Vite + Leaflet)
│   ├── src/
│   │   ├── components/
│   │   │   ├── RouteForm.jsx   # Input form with quick-load presets
│   │   │   ├── RouteMap.jsx    # Leaflet map showing polyline route & pins
│   │   │   ├── SummaryCard.jsx # Total distance, duration, stops, cost
│   │   │   └── FuelStopsList.jsx# Table of optimal fuel stops
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── .env.example
├── Postman_collection.json     # Ready-to-import Postman collection
├── README.md
└── .gitignore
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (`Backend/`)

```bash
# 1. Open terminal and navigate to Backend
cd Backend

# 2. Activate virtual environment (from project root or create new)
# If using existing venv from root:
..\venv\Scripts\activate   # Windows
# source ../venv/bin/activate  # macOS / Linux

# 3. (Optional) Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env
# Edit .env and supply your free ORS_API_KEY from https://openrouteservice.org/

# 5. Run tests to verify setup
python manage.py test

# 6. Start the Django backend server
python manage.py runserver 8000
```
> **Note:** The SQLite database `db.sqlite3` is already migrated and seeded with 6,738 truck stops (6,618 geocoded US locations). If you ever need to re-import, run `python manage.py import_fuel_data`.

---

### 2. Frontend Setup (`Frontend/`)

```bash
# 1. In a new terminal, navigate to Frontend
cd Frontend

# 2. Install Node dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev
```

Visit **http://localhost:5173** to access the interactive web application.

---

## 📡 API Specification

### Endpoint: `POST /api/v1/routes/plan/`

#### Request Headers:
`Content-Type: application/json`

#### Request Body:
```json
{
  "start": "New York, NY",
  "finish": "Los Angeles, CA"
}
```

#### Response (`200 OK`):
```json
{
  "status": "success",
  "summary": {
    "total_distance_miles": 2795.4,
    "duration_hours": 41.5,
    "total_fuel_stops": 6,
    "total_gallons_consumed": 279.54,
    "total_fuel_cost": 842.15,
    "average_price_per_gallon": 3.012
  },
  "route": {
    "start": "New York, NY",
    "finish": "Los Angeles, CA",
    "start_location": {
      "query": "New York, NY",
      "coordinates": [40.7128, -74.0060]
    },
    "finish_location": {
      "query": "Los Angeles, CA",
      "coordinates": [34.0522, -118.2437]
    },
    "total_distance_miles": 2795.4,
    "duration_hours": 41.5,
    "geometry": { "type": "LineString", "coordinates": [...] },
    "coordinates": [[40.7128, -74.0060], ...]
  },
  "optimal_fuel_stops": [
    {
      "stop_index": 1,
      "distance_along_route_miles": 420.5,
      "gallons_to_fill": 42.05,
      "cost": 126.15,
      "truck_stop": {
        "name": "TA TRAVEL CENTER #001",
        "address": "123 Highway Blvd",
        "city": "Youngstown",
        "state": "OH",
        "retail_price": "2.999",
        "latitude": 41.0998,
        "longitude": -80.6495
      }
    }
  ],
  "fuel_plan": {
    "assumptions": {
      "vehicle_starts_with_full_tank": true,
      "tank_range_miles": 500,
      "mpg": 10,
      "always_fill_to_full": true
    },
    "total_fuel_stops": 6,
    "total_gallons": 279.54,
    "total_fuel_cost_usd": 842.15,
    "stops": [...]
  }
}
```

---

## 🧠 Core Optimization Algorithm

### Key Constraints & Documented Assumptions
1. **Vehicle Range:** 500 miles on a full tank (50-gallon tank capacity at 10 MPG).
2. **Fuel Economy:** 10.0 miles per gallon.
3. **Initial State:** The vehicle starts at `start` with a **100% full fuel tank** (500 miles range).
4. **Refueling Strategy:** Whenever the vehicle stops, it fills the tank back up to full.
5. **Lateral Corridor:** Only stops within 50 miles lateral distance of the route are considered.

### How the Algorithm Works
1. **Bounding-Box Query:** Retrieves candidate stops inside the route bounding box from SQLite with spatial index filtering.
2. **Haversine Projection:** Projects stops onto the route polyline to determine:
   - `route_miles`: distance along the route from the starting point.
   - `lateral_miles`: detour distance from the highway corridor.
3. **Greedy Look-Ahead:**
   - In each decision window $[current\_miles, current\_miles + 500]$, it evaluates all reachable candidate stops.
   - It searches the high-efficiency zone (between 50% and 95% of tank capacity, i.e., 250–475 miles).
   - Chooses the stop with the minimum retail price per gallon.
   - Advances `current_miles` to the chosen stop and tops off fuel.
   - Stops as soon as the remaining distance to destination $\le$ remaining tank range.

---

