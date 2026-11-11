from django.test import TestCase
from decimal import Decimal
from apps.fuel.models import TruckStop

class TruckStopModelTestCase(TestCase):
    def setUp(self):
        self.stop = TruckStop.objects.create(
            opis_id=12345,
            name="Test Travel Plaza",
            address="100 Highway 1",
            city="Columbus",
            state="OH",
            rack_id=99,
            retail_price=Decimal("3.459"),
            latitude=39.9612,
            longitude=-82.9988,
            geocoded=True,
        )

    def test_truck_stop_creation(self):
        self.assertEqual(self.stop.opis_id, 12345)
        self.assertEqual(self.stop.name, "Test Travel Plaza")
        self.assertEqual(str(self.stop), "Test Travel Plaza (Columbus, OH) — $3.459/gal")

    def test_geocoded_filter(self):
        ungeocoded = TruckStop.objects.create(
            opis_id=67890,
            name="Ungeocoded Stop",
            address="Unknown Rd",
            city="Nowhere",
            state="OH",
            rack_id=99,
            retail_price=Decimal("4.000"),
            latitude=None,
            longitude=None,
            geocoded=False,
        )
        geocoded_stops = TruckStop.objects.filter(geocoded=True)
        self.assertIn(self.stop, geocoded_stops)
        self.assertNotIn(ungeocoded, geocoded_stops)
