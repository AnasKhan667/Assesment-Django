import logging
import requests

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RoutePlanRequestSerializer
from .services.routing import ORSClient
from apps.fuel.services.optimizer import optimize_fuel_stops

logger = logging.getLogger(__name__)

METERS_PER_MILE = 1609.344


class RoutePlanView(APIView):
    """
    POST /api/v1/routes/plan/

    Accepts start and finish US locations, returns:
      - Full GeoJSON and Leaflet route geometry
      - Optimal fuel stop locations (cost-minimizing)
      - Total fuel cost & detailed trip summary
    """

    def post(self, request):
        serializer = RoutePlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start = serializer.validated_data["start"]
        finish = serializer.validated_data["finish"]

        client = ORSClient()

        # Step 1: Geocode start + finish (parallel)
        try:
            start_coords, finish_coords = client.geocode_parallel(start, finish)
        except requests.exceptions.HTTPError as exc:
            if exc.response is not None and exc.response.status_code in (401, 403):
                return Response(
                    {
                        "error": "OpenRouteService API key is missing or invalid. "
                        "Please sign up for a free key at https://openrouteservice.org/dev/#/signup "
                        "and add it to Backend/.env as ORS_API_KEY."
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {"error": f"Geocoding service error: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except Exception as exc:
            logger.error("Geocoding failed: %s", exc)
            return Response(
                {"error": "Could not geocode one or both locations. Please specify valid US cities/states."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Step 2: Get route from ORS (1 routing API call)
        try:
            route_data = client.get_route(start_coords, finish_coords)
        except requests.exceptions.HTTPError as exc:
            if exc.response is not None and exc.response.status_code in (401, 403):
                return Response(
                    {
                        "error": "OpenRouteService API key is invalid or unauthorized. Please verify ORS_API_KEY in Backend/.env."
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {"error": "Routing service failed to calculate directions for the selected points."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as exc:
            logger.error("Routing API failed: %s", exc)
            return Response(
                {"error": "Routing service is temporarily unavailable or route could not be found."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Extract route details
        feature = route_data["features"][0]
        geometry = feature["geometry"]  # GeoJSON LineString [lon, lat]
        summary = feature["properties"]["summary"]
        dist_miles = summary["distance"] / METERS_PER_MILE
        duration_hours = summary["duration"] / 3600

        # Step 3: Fuel stop optimization (pure Python, fast greedy look-ahead)
        result = optimize_fuel_stops(geometry["coordinates"], dist_miles)

        # Convert [lon, lat] -> [lat, lon] for Leaflet mapping
        leaflet_coords = [[pt[1], pt[0]] for pt in geometry["coordinates"]]
        start_lat_lon = [start_coords[1], start_coords[0]]
        finish_lat_lon = [finish_coords[1], finish_coords[0]]

        # Format optimal fuel stops for both API & UI
        optimal_fuel_stops = []
        for idx, s in enumerate(result.fuel_stops, start=1):
            optimal_fuel_stops.append({
                "stop_index": idx,
                "distance_along_route_miles": round(s.miles_from_start, 1),
                "gallons_to_fill": round(s.gallons_added, 2),
                "cost": round(s.cost, 2),
                "truck_stop": {
                    "name": s.name,
                    "address": getattr(s, 'address', ''),
                    "city": s.city,
                    "state": s.state,
                    "retail_price": s.retail_price,
                    "latitude": s.latitude,
                    "longitude": s.longitude,
                }
            })

        avg_price = (
            round(result.total_cost / result.total_gallons, 3)
            if result.total_gallons > 0 else 0.0
        )

        trip_summary = {
            "total_distance_miles": round(dist_miles, 1),
            "duration_hours": round(duration_hours, 1),
            "total_fuel_stops": len(result.fuel_stops),
            "total_gallons_consumed": round(result.total_gallons, 2),
            "total_fuel_cost": round(result.total_cost, 2),
            "average_price_per_gallon": avg_price,
        }

        return Response({
            "status": "success",
            "summary": trip_summary,
            "route": {
                "start": start,
                "finish": finish,
                "start_location": {
                    "query": start,
                    "coordinates": start_lat_lon,
                },
                "finish_location": {
                    "query": finish,
                    "coordinates": finish_lat_lon,
                },
                "total_distance_miles": round(dist_miles, 1),
                "duration_hours": round(duration_hours, 1),
                "geometry": geometry,
                "coordinates": leaflet_coords,
            },
            "optimal_fuel_stops": optimal_fuel_stops,
            "fuel_plan": {
                "assumptions": {
                    "vehicle_starts_with_full_tank": True,
                    "tank_range_miles": 500,
                    "mpg": 10,
                    "always_fill_to_full": True,
                },
                "total_fuel_stops": len(result.fuel_stops),
                "total_gallons": round(result.total_gallons, 2),
                "total_fuel_cost_usd": round(result.total_cost, 2),
                "stops": optimal_fuel_stops,
            },
        })
