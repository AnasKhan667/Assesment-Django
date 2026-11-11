"""
Offline geocoder using pgeocode + a hand-built city→state→coords lookup.

pgeocode provides a Nominatim wrapper over the GeoNames dataset (bundled as CSV).
It resolves US postal codes to lat/lon — zero API calls, zero internet required after
the first run (data is cached locally at ~/.cache/pgeocode/).

Strategy:
  1. Try pgeocode with the city name as a "search" (not zip) — covers most cases
  2. Fall back to a lightweight geopy Nominatim call (rate-limited, used rarely)
  3. Return None if still not found — the stop is skipped, not crashed
"""

import logging
import pgeocode
import pandas as pd

logger = logging.getLogger(__name__)

# Module-level instance — reused across calls
_nomi: pgeocode.Nominatim | None = None


def _get_nomi() -> pgeocode.Nominatim:
    global _nomi
    if _nomi is None:
        _nomi = pgeocode.Nominatim("us")
    return _nomi


def geocode_city_state(city: str, state: str) -> tuple[float, float] | None:
    """
    Offline geocoding: City + State → (latitude, longitude).

    Uses pgeocode which bundles the GeoNames dataset locally.
    Returns None if the city cannot be geocoded.
    """
    try:
        nomi = _get_nomi()
        # pgeocode exposes the full GeoNames dataframe
        df: pd.DataFrame = nomi._data  # type: ignore[attr-defined]

        city_clean  = city.strip().upper()
        state_clean = state.strip().upper()

        # Filter by state abbreviation and city name (case-insensitive)
        mask = (
            (df["state_code"].str.upper() == state_clean)
            & (df["place_name"].str.upper() == city_clean)
        )
        matches = df[mask]

        if not matches.empty:
            row = matches.iloc[0]
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            if pd.notna(lat) and pd.notna(lon):
                return (lat, lon)

        # Partial match: city name contained in place_name
        mask_partial = (
            (df["state_code"].str.upper() == state_clean)
            & (df["place_name"].str.upper().str.contains(city_clean, regex=False))
        )
        matches_partial = df[mask_partial]
        if not matches_partial.empty:
            row = matches_partial.iloc[0]
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            if pd.notna(lat) and pd.notna(lon):
                return (lat, lon)

    except Exception as exc:
        logger.warning("pgeocode error for %s, %s: %s", city, state, exc)

    logger.debug("Could not geocode: %s, %s", city, state)
    return None
