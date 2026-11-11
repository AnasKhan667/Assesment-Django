from django.db import models


class TruckStop(models.Model):
    """
    Represents a truck stop with fuel price data from the OPIS CSV dataset.
    Lat/lon are geocoded offline using uszipcode (City + State lookup).
    """
    opis_id      = models.IntegerField(unique=True, db_index=True)
    name         = models.CharField(max_length=255)
    address      = models.CharField(max_length=300)
    city         = models.CharField(max_length=100)
    state        = models.CharField(max_length=2, db_index=True)
    rack_id      = models.IntegerField()
    retail_price = models.DecimalField(max_digits=10, decimal_places=5)
    latitude     = models.FloatField(null=True, blank=True, db_index=True)
    longitude    = models.FloatField(null=True, blank=True, db_index=True)
    geocoded     = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
            models.Index(fields=["retail_price"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.city}, {self.state}) — ${self.retail_price}/gal"

