from django.contrib import admin
from .models import TruckStop


@admin.register(TruckStop)
class TruckStopAdmin(admin.ModelAdmin):
    list_display  = ("name", "city", "state", "retail_price", "geocoded")
    list_filter   = ("state", "geocoded")
    search_fields = ("name", "city", "state")
    ordering      = ("retail_price",)

