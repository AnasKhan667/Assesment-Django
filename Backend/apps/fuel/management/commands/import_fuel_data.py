import csv
import logging
from django.core.management.base import BaseCommand
from apps.fuel.models import TruckStop
from apps.fuel.services.geocoder import geocode_city_state

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Import fuel price CSV and geocode truck stop locations (run once)"

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_path",
            type=str,
            nargs="?",
            default="data/fuel_prices.csv",
            help="Path to the OPIS fuel prices CSV file",
        )

    def handle(self, *args, **options):
        csv_path = options["csv_path"]
        self.stdout.write(f"Importing from: {csv_path}")

        # --- Pass 1: de-duplicate by OPIS ID, keep lowest price ---
        best_rows: dict[int, dict] = {}
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                try:
                    opis_id = int(row["OPIS Truckstop ID"])
                    price   = float(row["Retail Price"])
                except (ValueError, KeyError):
                    continue
                if opis_id not in best_rows or price < float(best_rows[opis_id]["Retail Price"]):
                    best_rows[opis_id] = row

        self.stdout.write(f"Unique truck stops to process: {len(best_rows)}")

        created = updated = geocoded_count = skipped = 0

        for opis_id, row in best_rows.items():
            city  = row["City"].strip()
            state = row["State"].strip()

            coords = geocode_city_state(city, state)
            lat, lon = coords if coords else (None, None)
            is_geocoded = coords is not None
            if is_geocoded:
                geocoded_count += 1
            else:
                skipped += 1
                logger.debug("Could not geocode: %s, %s", city, state)

            obj, was_created = TruckStop.objects.update_or_create(
                opis_id=opis_id,
                defaults={
                    "name":         row["Truckstop Name"].strip(),
                    "address":      row["Address"].strip(),
                    "city":         city,
                    "state":        state,
                    "rack_id":      int(row["Rack ID"]),
                    "retail_price": float(row["Retail Price"]),
                    "latitude":     lat,
                    "longitude":    lon,
                    "geocoded":     is_geocoded,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created: {created} | Updated: {updated} | "
            f"Geocoded: {geocoded_count} | Missing coords: {skipped}"
        ))

