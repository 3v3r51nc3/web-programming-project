from django.urls import path
from .views import hello
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ParticipantViewSet, RegistrationViewSet

router = DefaultRouter()
router.register(r"events", EventViewSet)
router.register(r"participants", ParticipantViewSet)
router.register(r"registrations", RegistrationViewSet)

urlpatterns = router.urls
