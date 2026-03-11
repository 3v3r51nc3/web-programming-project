# Backend developer: Maksym DOLHOV
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Event, Participant, Registration
from .serializers import EventSerializer, ParticipantSerializer, RegistrationSerializer

# Create your views here.
#get post etc...
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("id")
    serializer_class = EventSerializer


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all().order_by("id")
    serializer_class = ParticipantSerializer


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all().order_by("id")
    serializer_class = RegistrationSerializer
