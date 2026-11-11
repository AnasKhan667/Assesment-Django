import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

ORS_BASE = "https://api.openrouteservice.org"


class ORSClient:
    """
    OpenRouteService API client.
    Free tier: 2,000 requests/day, 40 req/min.
    No credit card required.

    Total external API calls per route request: 3
      - 2 geocoding calls (run in parallel via ThreadPoolExecutor)
      - 1 directions call
    """

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": settings.ORS_API_KEY,
            "Accept":        "application/json, application/geo+json",
            "Content-Type":  "application/json",
        })

    def geocode(self, location: str) -> tuple[float, float]:
        """
        Geocode a free-text location string to (longitude, latitude).
        Uses ORS Geocoding API (powered by Pelias + OpenStreetMap).
        Returns (lon, lat) — ORS coordinate order.
        """
        resp = self.session.get(
            f"{ORS_BASE}/geocode/search",
            params={
                "text":             location,
                "boundary.country": "US",
                "size":             1,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        features = data.get("features", [])
        if not features:
            raise ValueError(f"Could not geocode location: '{location}'")
        lon, lat = features[0]["geometry"]["coordinates"]
        logger.debug("Geocoded '%s' → lon=%.4f, lat=%.4f", location, lon, lat)
        return (lon, lat)

    def geocode_parallel(
        self, start: str, finish: str
    ) -> tuple[tuple[float, float], tuple[float, float]]:
        """
        Geocode start and finish in parallel using 2 threads.
        Reduces latency vs sequential calls.
        """
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_start  = executor.submit(self.geocode, start)
            future_finish = executor.submit(self.geocode, finish)
            start_coords  = future_start.result()
            finish_coords = future_finish.result()
        return start_coords, finish_coords

    def get_route(
        self,
        start_coords:  tuple[float, float],
        finish_coords: tuple[float, float],
    ) -> dict:
        """
        Get driving directions from ORS.
        Single POST call returns full GeoJSON route with:
          - geometry (LineString with all waypoints)
          - summary (distance in meters, duration in seconds)

        Returns the raw GeoJSON FeatureCollection.
        """
        payload = {
            "coordinates": [list(start_coords), list(finish_coords)],
            "instructions": False,
            "geometry_simplify": False,
            "units": "m",
        }
        resp = self.session.post(
            f"{ORS_BASE}/v2/directions/driving-car/geojson",
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

