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


class IsAuthenticatedReadOnlyOrAdminWrite(permissions.BasePermission):
    """
    Authenticated users may read.
    Only admins may create, update, or delete records.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.is_staff)


class IsAuthenticatedReadCreateOrAdminManage(permissions.BasePermission):
    """
    Authenticated users may read registrations and create their own registration.
    Only admins may update or delete registrations.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS or request.method == "POST":
            return True
        return bool(request.user.is_staff)
