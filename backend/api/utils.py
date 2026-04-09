from .models import Participant


def normalize_email(value):
    return (value or "").strip().lower()


def sync_participant_for_user(user):
    email = normalize_email(getattr(user, "email", ""))
    if not email:
        return None

    participant = Participant.objects.filter(email__iexact=email).first()
    if participant is None:
        return Participant.objects.create(
            first_name=(getattr(user, "first_name", "") or getattr(user, "username", "") or "Member").strip()[:100],
            last_name=(getattr(user, "last_name", "") or "").strip()[:100],
            email=email,
        )

    updated_fields = []
    first_name = (getattr(user, "first_name", "") or "").strip()[:100]
    last_name = (getattr(user, "last_name", "") or "").strip()[:100]

    if participant.email != email:
        participant.email = email
        updated_fields.append("email")

    if first_name and participant.first_name != first_name:
        participant.first_name = first_name
        updated_fields.append("first_name")

    if last_name and participant.last_name != last_name:
        participant.last_name = last_name
        updated_fields.append("last_name")

    if updated_fields:
        participant.save(update_fields=updated_fields)

    return participant
