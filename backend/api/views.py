# Backend developer: Maksym DOLHOV
from rest_framework import viewsets, generics, permissions
from django.db.models import Count, Q
from .models import Event, Participant, Registration
from .serializers import (
    EventSerializer,
    ParticipantSerializer,
    RegistrationSerializer,
    UserSerializer,
    UserRegistrationSerializer,
)
from .permissions import (
    IsAdminOrReadOnly,
    IsAuthenticatedReadOnlyOrAdminWrite,
)
from .utils import sync_participant_for_user


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Event.objects.annotate(
            confirmed_registrations_count=Count(
                "registrations",
                filter=Q(registrations__status="confirmed"),
            )
        ).order_by("id")


class ParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ParticipantSerializer
    permission_classes = [IsAuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and not user.is_staff:
            sync_participant_for_user(user)
        return Participant.objects.all().order_by("id")


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        user = self.request.user
        queryset = Registration.objects.select_related("event", "participant").order_by("id")
        if user.is_staff:
            return queryset

        participant = sync_participant_for_user(user)
        if participant is None:
            return queryset.none()

        return queryset.filter(participant=participant)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
