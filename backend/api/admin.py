# Backend developer: Maksym DOLHOV
from django.contrib import admin
from .models import Event, Participant, Registration

# Register your models here.
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date', 'location', 'capacity')
    search_fields = ('title', 'location')
    list_filter = ('date',)


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email')
    search_fields = ('first_name', 'last_name', 'email')


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'participant', 'status', 'registered_at')
    search_fields = ('event__title', 'participant__email')
    list_filter = ('status', 'registered_at')
