# Backend developer: Maksym DOLHOV
from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Event, Participant, Registration
from .utils import normalize_email, sync_participant_for_user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff"]
        read_only_fields = ["id", "is_staff"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        email = normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        sync_participant_for_user(user)
        return user


class EventSerializer(serializers.ModelSerializer):
    confirmed_registrations_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "location",
            "capacity",
            "created_at",
            "confirmed_registrations_count",
        ]

    def validate_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value

    def get_confirmed_registrations_count(self, obj):
        if hasattr(obj, "confirmed_registrations_count"):
            return obj.confirmed_registrations_count
        return obj.registrations.filter(status="confirmed").count()


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
        request = self.context.get("request")
        user = getattr(request, "user", None)
        event = attrs.get("event", getattr(self.instance, "event", None))
        participant = attrs.get("participant", getattr(self.instance, "participant", None))
        status_value = attrs.get("status", getattr(self.instance, "status", "confirmed"))

        if user and user.is_authenticated and not user.is_staff:
            own_participant = sync_participant_for_user(user)
            if own_participant is None:
                raise serializers.ValidationError(
                    {"participant": "Add an email address to your account before registering for events."}
                )

            if participant and participant != own_participant:
                raise serializers.ValidationError(
                    {"participant": "Viewers can register only their own participant profile."}
                )

            attrs["participant"] = own_participant
            participant = own_participant

            if status_value != "confirmed":
                raise serializers.ValidationError(
                    {"status": "Viewers can only create confirmed registrations."}
                )

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
