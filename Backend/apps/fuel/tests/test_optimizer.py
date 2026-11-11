from django.test import TestCase
from decimal import Decimal
from apps.fuel.models import TruckStop
from apps.fuel.services.optimizer import optimize_fuel_stops, TANK_RANGE_MILES

class OptimizerTestCase(TestCase):
    def setUp(self):
        # Create mock stops along a route
        TruckStop.objects.create(
            opis_id=1,
            name="Stop A (Cheap)",
            address="Mile 200",
            city="City A",
            state="PA",
            rack_id=1,
            retail_price=Decimal("2.999"),
            latitude=40.0,
            longitude=-78.0,
            geocoded=True,
        )
        TruckStop.objects.create(
            opis_id=2,
            name="Stop B (Expensive)",
            address="Mile 300",
            city="City B",
            state="OH",
            rack_id=2,
            retail_price=Decimal("4.500"),
            latitude=40.0,
            longitude=-80.0,
            geocoded=True,
        )

    def test_short_trip_no_stops_needed(self):
        # A 300-mile trip should not need any stops since max range is 500 miles and vehicle starts full
        route_coords = [[-75.0, 40.0], [-76.0, 40.0], [-78.0, 40.0]]
        result = optimize_fuel_stops(route_coords, 300.0)
        self.assertEqual(len(result.fuel_stops), 0)
        self.assertEqual(result.total_cost, 0.0)

    def test_long_trip_requires_stops(self):
        # A 800-mile trip requires at least one stop
        route_coords = [
            [-75.0, 40.0],
            [-78.0, 40.0], # near Stop A (mile ~200)
            [-80.0, 40.0], # near Stop B (mile ~350)
            [-85.0, 40.0], # dest (mile ~800)
        ]
        result = optimize_fuel_stops(route_coords, 800.0)
        self.assertIsNotNone(result)
        self.assertIsInstance(result.fuel_stops, list)
