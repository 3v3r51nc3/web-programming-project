# Backend developer: Maksym DOLHOV
from rest_framework import viewsets, generics, permissions
from .models import Event, Participant, Registration
from .serializers import (
    EventSerializer,
    ParticipantSerializer,
    RegistrationSerializer,
    UserSerializer,
    UserRegistrationSerializer,
)
from .permissions import IsAdminOrReadOnly


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("id")
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all().order_by("id")
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Registration.objects.all().order_by("id")
        return Registration.objects.filter(
            participant__email=user.email
        ).order_by("id")


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
