from rest_framework import serializers
from django.utils import timezone
from .models import Event, Participant, Registration


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

    def validate_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = "__all__"


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    participant_email = serializers.EmailField(source="participant.email", read_only=True)

    class Meta:
        model = Registration
        fields = "__all__"

    def validate(self, attrs):
        event = attrs.get("event", getattr(self.instance, "event", None))
        participant = attrs.get("participant", getattr(self.instance, "participant", None))
        status_value = attrs.get("status", getattr(self.instance, "status", "confirmed"))

        if not event or not participant:
            return attrs

        if event.date < timezone.now():
            raise serializers.ValidationError("Cannot register for an event in the past.")

        duplicate_qs = Registration.objects.filter(event=event, participant=participant)
        if self.instance:
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)

        if duplicate_qs.exists():
            raise serializers.ValidationError("This participant is already registered for this event.")

        if status_value == "confirmed":
            confirmed_qs = Registration.objects.filter(event=event, status="confirmed")
            if self.instance and self.instance.status == "confirmed":
                confirmed_qs = confirmed_qs.exclude(pk=self.instance.pk)

            if confirmed_qs.count() >= event.capacity:
                raise serializers.ValidationError("Event capacity has been reached.")

        return attrs