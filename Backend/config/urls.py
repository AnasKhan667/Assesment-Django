from django.urls import path, include

urlpatterns = [
    path("api/v1/routes/", include("apps.routes.urls")),
]
