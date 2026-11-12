import logging
from dataclasses import dataclass, field

from haversine import haversine, Unit

from apps.fuel.models import TruckStop

logger = logging.getLogger(__name__)


TANK_RANGE_MILES   = 500.0   # Vehicle max range on a full tank
MPG                = 10.0    # Miles per gallon
CORRIDOR_MILES     = 50.0    # Lateral search radius around route
LOOKAHEAD_RATIO    = 0.5     # Prefer stops past 50% of remaining range


@dataclass
class FuelStop:
    name:              str
    address:           str
    city:              str
    state:             str
    latitude:          float
    longitude:         float
    retail_price:      float
    gallons_added:     float
    cost:              float
    miles_from_start:  float


@dataclass
class OptimizationResult:
    fuel_stops:    list[FuelStop] = field(default_factory=list)
    total_cost:    float = 0.0
    total_miles:   float = 0.0
    total_gallons: float = 0.0



def optimize_fuel_stops(
    route_coords: list[list[float]],
    total_distance_miles: float,
) -> OptimizationResult:
    """
    Greedy look-ahead algorithm to select cost-optimal fuel stops.

    Assumptions (documented):
      - Vehicle starts with a FULL tank (500-mile range)
      - Vehicle achieves exactly 10 MPG
      - We always fill to full at each stop

    Args:
        route_coords: List of [lon, lat] coordinate pairs from ORS GeoJSON
        total_distance_miles: Total route distance in miles

    Returns:
        OptimizationResult with ordered fuel stops and cost summary
    """
    result = OptimizationResult(total_miles=round(total_distance_miles, 1))

    if total_distance_miles <= TANK_RANGE_MILES:
        # Route fits in one tank — no stops needed
        logger.info("Route (%.1f mi) fits in one tank. No fuel stops needed.", total_distance_miles)
        return result

    # Convert [lon, lat] → (lat, lon) tuples for haversine
    waypoints: list[tuple[float, float]] = [(c[1], c[0]) for c in route_coords]

    # Build cumulative distance array: cumulative[i] = miles from start to waypoints[i]
    cumulative = _build_cumulative_distances(waypoints)

    # Pre-load candidate stops within the route bounding box + buffer
    candidates = _load_candidate_stops(waypoints)
    logger.info("Candidate stops within route corridor: %d", len(candidates))

    if not candidates:
        logger.warning("No geocoded truck stops found near this route.")
        return result

    # Project every candidate stop onto the route once (expensive step — done upfront)
    projected = _project_stops_onto_route(candidates, waypoints, cumulative)
    logger.debug("Projected %d stops onto route", len(projected))

    # Greedy loop
    current_miles    = 0.0
    tank_remaining   = TANK_RANGE_MILES   # starts full

    while True:
        miles_to_dest = total_distance_miles - current_miles

        if miles_to_dest <= tank_remaining:
            # We can reach the destination — done
            break

        # Find stops reachable from current position
        reachable = [
            s for s in projected
            if current_miles < s["route_miles"] <= current_miles + tank_remaining
        ]

        if not reachable:
            logger.error(
                "No reachable fuel stops between miles %.1f and %.1f. "
                "Route may pass through a region with no truck stops.",
                current_miles, current_miles + tank_remaining,
            )
            break

        # Sort by price (cheapest first)
        reachable.sort(key=lambda s: s["stop"].retail_price)

        # Prefer cheapest stop past the look-ahead threshold
        threshold = current_miles + (tank_remaining * LOOKAHEAD_RATIO)
        past_halfway = [s for s in reachable if s["route_miles"] >= threshold]
        chosen = past_halfway[0] if past_halfway else reachable[0]

        # Calculate fuel needed
        miles_to_stop   = chosen["route_miles"] - current_miles
        tank_after_stop = tank_remaining - miles_to_stop   # miles left on arrival
        gallons_to_fill = (TANK_RANGE_MILES - tank_after_stop) / MPG
        cost            = gallons_to_fill * float(chosen["stop"].retail_price)

        result.fuel_stops.append(FuelStop(
            name             = chosen["stop"].name,
            address          = getattr(chosen["stop"], "address", ""),
            city             = chosen["stop"].city,
            state            = chosen["stop"].state,
            latitude         = chosen["stop"].latitude,
            longitude        = chosen["stop"].longitude,
            retail_price     = float(chosen["stop"].retail_price),
            gallons_added    = round(gallons_to_fill, 3),
            cost             = round(cost, 2),
            miles_from_start = round(chosen["route_miles"], 1),
        ))

        result.total_cost    += cost
        result.total_gallons += gallons_to_fill

        # Update position — tank is now full
        tank_remaining = TANK_RANGE_MILES
        current_miles  = chosen["route_miles"]

    result.total_cost    = round(result.total_cost, 2)
    result.total_gallons = round(result.total_gallons, 3)
    return result


def _build_cumulative_distances(waypoints: list[tuple[float, float]]) -> list[float]:
    """cumulative[i] = total miles from start to waypoints[i]."""
    cumulative = [0.0]
    for i in range(1, len(waypoints)):
        d = haversine(waypoints[i - 1], waypoints[i], unit=Unit.MILES)
        cumulative.append(cumulative[-1] + d)
    return cumulative


def _load_candidate_stops(waypoints: list[tuple[float, float]]) -> list:
    """
    DB query limited to the route bounding box + ~50-mile buffer.
    Avoids loading all 7k+ rows into memory.
    """
    lats = [w[0] for w in waypoints]
    lons = [w[1] for w in waypoints]
    buffer = 0.75   # ~50 miles in degrees at mid-US latitudes
    return list(
        TruckStop.objects.filter(
            geocoded=True,
            latitude__gte=min(lats) - buffer,
            latitude__lte=max(lats) + buffer,
            longitude__gte=min(lons) - buffer,
            longitude__lte=max(lons) + buffer,
        ).order_by("retail_price")
    )


def _project_stops_onto_route(
    candidates: list,
    waypoints:  list[tuple[float, float]],
    cumulative: list[float],
) -> list[dict]:
    """
    For each candidate stop, find its nearest route waypoint and lateral distance.
    Returns only stops within CORRIDOR_MILES of the route.
    """
    projected = []
    for stop in candidates:
        stop_pt = (stop.latitude, stop.longitude)
        min_dist = float("inf")
        nearest_idx = 0
        # Scan every waypoint — O(n) per stop, but waypoints are pre-simplified by ORS
        for i, wp in enumerate(waypoints):
            d = haversine(stop_pt, wp, unit=Unit.MILES)
            if d < min_dist:
                min_dist = d
                nearest_idx = i
        if min_dist <= CORRIDOR_MILES:
            projected.append({
                "stop":        stop,
                "route_miles": cumulative[nearest_idx],
                "lateral":     min_dist,
            })
    return projected

