from unittest.mock import patch
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.fuel.models import TruckStop

class RoutePlanViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/routes/plan/"

        # Populate sample truck stop in DB
        TruckStop.objects.create(
            opis_id=901,
            name="Midway Travel Plaza",
            address="100 Interstate 80",
            city="Omaha",
            state="NE",
            rack_id=1,
            retail_price=Decimal("3.159"),
            latitude=41.2565,
            longitude=-95.9345,
            geocoded=True,
        )

    def test_invalid_request_missing_fields(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("start", response.data)
        self.assertIn("finish", response.data)

    @patch("apps.routes.views.ORSClient.geocode_parallel")
    @patch("apps.routes.views.ORSClient.get_route")
    def test_successful_route_planning(self, mock_get_route, mock_geocode):
        mock_geocode.return_value = ([-74.0060, 40.7128], [-87.6298, 41.8781])
        mock_get_route.return_value = {
            "features": [
                {
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-74.0060, 40.7128],
                            [-80.0, 41.0],
                            [-87.6298, 41.8781],
                        ]
                    },
                    "properties": {
                        "summary": {
                            "distance": 1287475.2, # ~800 miles in meters
                            "duration": 43200,      # 12 hours
                        }
                    }
                }
            ]
        }

        payload = {"start": "New York, NY", "finish": "Chicago, IL"}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["status"], "success")
        self.assertIn("summary", data)
        self.assertIn("route", data)
        self.assertIn("optimal_fuel_stops", data)
        self.assertIn("fuel_plan", data)
        self.assertAlmostEqual(data["summary"]["total_distance_miles"], 800.0, delta=1.0)

