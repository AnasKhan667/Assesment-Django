from rest_framework import serializers


class RoutePlanRequestSerializer(serializers.Serializer):
    start  = serializers.CharField(
        max_length=200,
        help_text="Start location (US city, e.g. 'New York, NY')",
    )
    finish = serializers.CharField(
        max_length=200,
        help_text="End location (US city, e.g. 'Los Angeles, CA')",
    )

    def validate_start(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Start location is too short.")
        return value

    def validate_finish(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Finish location is too short.")
        return value

    def validate(self, data: dict) -> dict:
        if data.get("start", "").lower() == data.get("finish", "").lower():
            raise serializers.ValidationError(
                "Start and finish must be different locations."
            )
        return data

