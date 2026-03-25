# Backend developer: Maksym DOLHOV
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    SAFE methods (GET, HEAD, OPTIONS) are open to everyone.
    Write methods (POST, PUT, PATCH, DELETE) require is_staff=True.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
