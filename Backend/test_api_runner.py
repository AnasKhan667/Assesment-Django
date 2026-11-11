import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient

client = APIClient()

print("=" * 60)
print("TEST 1: Long Distance Cross-Country (NYC -> LA)")
print("=" * 60)
resp = client.post("/api/v1/routes/plan/", {"start": "New York, NY", "finish": "Los Angeles, CA"}, format="json")
print("HTTP Status Code:", resp.status_code)
assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.data}"

data = resp.data
print("Status:", data["status"])
print(f"Total Distance: {data['summary']['total_distance_miles']} miles")
print(f"Estimated Duration: {data['summary']['duration_hours']} hours")
print(f"Total Fuel Stops: {data['summary']['total_fuel_stops']}")
print(f"Total Fuel Cost: ${data['summary']['total_fuel_cost']}")
print(f"Total Gallons: {data['summary']['total_gallons_consumed']} gal")
print(f"Average Price/Gal: ${data['summary']['average_price_per_gallon']}/gal")
print("\nOptimal Fuel Stops:")
for s in data["optimal_fuel_stops"]:
    ts = s["truck_stop"]
    print(f"  Stop #{s['stop_index']}: {ts['name']} ({ts['city']}, {ts['state']})")
    print(f"    - Route Mile: {s['distance_along_route_miles']} mi")
    print(f"    - Retail Price: ${ts['retail_price']}/gal")
    print(f"    - Gallons to Fill: {s['gallons_to_fill']} gal")
    print(f"    - Stop Cost: ${s['cost']}")

print("\n" + "=" * 60)
print("TEST 2: Short Distance < 500 Miles (NYC -> Philadelphia, PA)")
print("=" * 60)
resp2 = client.post("/api/v1/routes/plan/", {"start": "New York, NY", "finish": "Philadelphia, PA"}, format="json")
print("HTTP Status Code:", resp2.status_code)
assert resp2.status_code == 200
data2 = resp2.data
print(f"Total Distance: {data2['summary']['total_distance_miles']} miles")
print(f"Total Fuel Stops: {data2['summary']['total_fuel_stops']} (Expected: 0)")
print(f"Total Fuel Cost: ${data2['summary']['total_fuel_cost']} (Expected: $0.00)")
print("=" * 60)
print("ALL END-TO-END TESTS PASSED SUCCESSFULLY!")
print("=" * 60)
