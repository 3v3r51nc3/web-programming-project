# Backend developer: Maksym DOLHOV
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    EventViewSet,
    ParticipantViewSet,
    RegistrationViewSet,
    RegisterView,
    UserProfileView,
)

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"participants", ParticipantViewSet, basename="participant")
router.register(r"registrations", RegistrationViewSet, basename="registration")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", UserProfileView.as_view(), name="auth-me"),
] + router.urls
