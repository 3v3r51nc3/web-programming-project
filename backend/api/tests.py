# Backend developer: Maksym DOLHOV
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Event, Participant, Registration
from .utils import sync_participant_for_user


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class EventModelTest(TestCase):
    def _future_event(self, **kwargs):
        defaults = dict(
            title="Test Event",
            date=timezone.now() + timedelta(days=1),
            location="Paris",
            capacity=50,
        )
        defaults.update(kwargs)
        return Event.objects.create(**defaults)

    def test_create_event(self):
        event = self._future_event()
        self.assertEqual(event.title, "Test Event")
        self.assertEqual(event.capacity, 50)

    def test_str(self):
        event = self._future_event(title="Conference")
        self.assertIn("Conference", str(event))

    def test_description_optional(self):
        event = self._future_event(description="")
        self.assertEqual(event.description, "")


class ParticipantModelTest(TestCase):
    def test_create_participant(self):
        p = Participant.objects.create(
            first_name="Alice", last_name="Smith", email="alice@example.com"
        )
        self.assertEqual(str(p), "Alice Smith (alice@example.com)")

    def test_email_must_be_unique(self):
        Participant.objects.create(first_name="A", last_name="B", email="dup@test.com")
        with self.assertRaises(Exception):
            Participant.objects.create(first_name="C", last_name="D", email="dup@test.com")


class RegistrationModelTest(TestCase):
    def setUp(self):
        self.event = Event.objects.create(
            title="Meetup",
            date=timezone.now() + timedelta(days=2),
            location="Bordeaux",
            capacity=10,
        )
        self.participant = Participant.objects.create(
            first_name="Bob", last_name="Jones", email="bob@example.com"
        )

    def test_default_status_is_confirmed(self):
        reg = Registration.objects.create(event=self.event, participant=self.participant)
        self.assertEqual(reg.status, "confirmed")

    def test_str(self):
        reg = Registration.objects.create(event=self.event, participant=self.participant)
        self.assertIn("Bob Jones", str(reg))
        self.assertIn("Meetup", str(reg))

    def test_unique_together_prevents_duplicate(self):
        Registration.objects.create(event=self.event, participant=self.participant)
        with self.assertRaises(Exception):
            Registration.objects.create(event=self.event, participant=self.participant)


# ---------------------------------------------------------------------------
# Auth endpoint tests
# ---------------------------------------------------------------------------

class AuthTests(APITestCase):
    REGISTER_URL = "/api/auth/register/"
    TOKEN_URL = "/api/auth/token/"
    REFRESH_URL = "/api/auth/token/refresh/"
    ME_URL = "/api/auth/me/"

    def test_register_creates_user(self):
        resp = self.client.post(self.REGISTER_URL, {
            "username": "newuser",
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "SecurePass123!",
            "password2": "SecurePass123!",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertTrue(Participant.objects.filter(email="newuser@example.com").exists())

    def test_register_password_mismatch(self):
        resp = self.client.post(self.REGISTER_URL, {
            "username": "user2",
            "email": "user2@example.com",
            "password": "GoodPass1!",
            "password2": "Different1!",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        User.objects.create_user(username="taken", password="pass1234!")
        resp = self.client.post(self.REGISTER_URL, {
            "username": "taken",
            "email": "x@example.com",
            "password": "GoodPass1!",
            "password2": "GoodPass1!",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_rejected(self):
        User.objects.create_user(username="existing", email="existing@example.com", password="GoodPass1!")
        resp = self.client.post(self.REGISTER_URL, {
            "username": "new-account",
            "email": "existing@example.com",
            "password": "GoodPass1!",
            "password2": "GoodPass1!",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_obtain_token(self):
        User.objects.create_user(username="tokenuser", password="GoodPass1!")
        resp = self.client.post(self.TOKEN_URL, {"username": "tokenuser", "password": "GoodPass1!"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_obtain_token_wrong_password(self):
        User.objects.create_user(username="wrongpw", password="GoodPass1!")
        resp = self.client.post(self.TOKEN_URL, {"username": "wrongpw", "password": "wrong"})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        User.objects.create_user(username="refreshuser", password="GoodPass1!")
        tokens = self.client.post(self.TOKEN_URL, {"username": "refreshuser", "password": "GoodPass1!"}).data
        resp = self.client.post(self.REFRESH_URL, {"refresh": tokens["refresh"]})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_me_returns_current_user(self):
        user = User.objects.create_user(username="meuser", password="GoodPass1!")
        self.client.force_authenticate(user=user)
        resp = self.client.get(self.ME_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "meuser")

    def test_me_unauthenticated_returns_401(self):
        resp = self.client.get(self.ME_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_patch_updates_profile(self):
        user = User.objects.create_user(username="patchme", password="GoodPass1!")
        self.client.force_authenticate(user=user)
        resp = self.client.patch(self.ME_URL, {"first_name": "Updated"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["first_name"], "Updated")


# ---------------------------------------------------------------------------
# Event permission & validation tests
# ---------------------------------------------------------------------------

class EventTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", password="pass!", is_staff=True)
        self.user = User.objects.create_user(username="regular", password="pass!")
        self.valid_payload = {
            "title": "Workshop",
            "date": (timezone.now() + timedelta(days=3)).isoformat(),
            "location": "Paris",
            "capacity": 30,
        }

    def test_list_events_public(self):
        resp = self.client.get("/api/events/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_get_event_detail_public(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        self.client.force_authenticate(user=None)
        resp = self.client.get(f"/api/events/{event_id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["title"], "Workshop")

    def test_create_event_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_event_unauthenticated_forbidden(self):
        resp = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        resp = self.client.patch(f"/api/events/{event_id}/", {"title": "Updated"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["title"], "Updated")

    def test_delete_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        resp = self.client.delete(f"/api/events/{event_id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_event_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        self.client.force_authenticate(user=self.user)
        resp = self.client.delete(f"/api/events/{event_id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_event_past_date_rejected(self):
        self.client.force_authenticate(user=self.admin)
        payload = dict(self.valid_payload, date=(timezone.now() - timedelta(days=1)).isoformat())
        resp = self.client.post("/api/events/", payload)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_event_zero_capacity_rejected(self):
        self.client.force_authenticate(user=self.admin)
        payload = dict(self.valid_payload, capacity=0)
        resp = self.client.post("/api/events/", payload)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_event_list_includes_confirmed_registration_count(self):
        Participant.objects.create(first_name="Ada", last_name="Lovelace", email="ada@example.com")
        event = Event.objects.create(
            title="Counted Event",
            date=timezone.now() + timedelta(days=2),
            location="Paris",
            capacity=10,
        )
        Registration.objects.create(
            event=event,
            participant=Participant.objects.get(email="ada@example.com"),
            status="confirmed",
        )
        resp = self.client.get("/api/events/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        counted_event = next(item for item in resp.data if item["id"] == event.id)
        self.assertEqual(counted_event["confirmed_registrations_count"], 1)


# ---------------------------------------------------------------------------
# Participant tests
# ---------------------------------------------------------------------------

class ParticipantTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="adminpt", password="pass!", is_staff=True)
        self.user = User.objects.create_user(
            username="userpt",
            email="userpt@example.com",
            password="pass!",
        )
        self.payload = {"first_name": "Jane", "last_name": "Doe", "email": "jane@example.com"}

    def test_list_participants_unauthenticated_forbidden(self):
        resp = self.client.get("/api/participants/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_participants_authenticated_user_sees_only_own_profile(self):
        Participant.objects.create(first_name="Other", last_name="Person", email="other@example.com")
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/participants/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["email"], self.user.email)

    def test_list_participants_admin_sees_all(self):
        Participant.objects.create(first_name="Other", last_name="Person", email="other@example.com")
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/participants/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_create_participant_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/participants/", self.payload)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_participant_admin(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/participants/", self.payload)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_participant_unauthenticated_forbidden(self):
        resp = self.client.post("/api/participants/", self.payload)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_email_rejected(self):
        self.client.force_authenticate(user=self.admin)
        self.client.post("/api/participants/", self.payload)
        resp = self.client.post("/api/participants/", {
            "first_name": "John", "last_name": "Doe", "email": "jane@example.com"
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_participant(self):
        self.client.force_authenticate(user=self.admin)
        pid = self.client.post("/api/participants/", self.payload).data["id"]
        resp = self.client.delete(f"/api/participants/{pid}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Registration tests
# ---------------------------------------------------------------------------

class RegistrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="adminreg", email="admin@hub.com", password="pass!", is_staff=True
        )
        self.user = User.objects.create_user(
            username="userreg", email="userreg@hub.com", password="pass!"
        )
        self.event = Event.objects.create(
            title="Summit",
            date=timezone.now() + timedelta(days=5),
            location="Nice",
            capacity=2,
        )
        self.participant = Participant.objects.create(
            first_name="Tom", last_name="Brown", email="tom@example.com"
        )
        self.own_participant = sync_participant_for_user(self.user)

    def test_create_registration_authenticated(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/registrations/", {
            "event": self.event.id,
            "participant": self.own_participant.id,
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "confirmed")

    def test_create_registration_unauthenticated_forbidden(self):
        resp = self.client.post("/api/registrations/", {
            "event": self.event.id,
            "participant": self.participant.id,
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_registration_rejected(self):
        self.client.force_authenticate(user=self.user)
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": self.own_participant.id})
        resp = self.client.post("/api/registrations/", {"event": self.event.id, "participant": self.own_participant.id})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_regular_user_cannot_register_someone_else(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/registrations/", {
            "event": self.event.id,
            "participant": self.participant.id,
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_capacity_exceeded_rejected(self):
        self.client.force_authenticate(user=self.admin)
        p1 = Participant.objects.create(first_name="P1", last_name="L", email="p1@x.com")
        p2 = Participant.objects.create(first_name="P2", last_name="L", email="p2@x.com")
        p3 = Participant.objects.create(first_name="P3", last_name="L", email="p3@x.com")
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": p1.id})
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": p2.id})
        resp = self.client.post("/api/registrations/", {"event": self.event.id, "participant": p3.id})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_registration(self):
        reg = Registration.objects.create(event=self.event, participant=self.participant)
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(f"/api/registrations/{reg.id}/", {"status": "cancelled"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "cancelled")

    def test_cancelled_registration_frees_capacity(self):
        self.client.force_authenticate(user=self.admin)
        p1 = Participant.objects.create(first_name="A", last_name="L", email="a@x.com")
        p2 = Participant.objects.create(first_name="B", last_name="L", email="b@x.com")
        p3 = Participant.objects.create(first_name="C", last_name="L", email="c@x.com")
        r1 = self.client.post("/api/registrations/", {"event": self.event.id, "participant": p1.id}).data
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": p2.id})
        self.client.patch(f"/api/registrations/{r1['id']}/", {"status": "cancelled"})
        resp = self.client.post("/api/registrations/", {"event": self.event.id, "participant": p3.id})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_admin_sees_all_registrations(self):
        Registration.objects.create(event=self.event, participant=self.participant)
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/registrations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_regular_user_sees_only_own_registrations(self):
        other_participant = Participant.objects.create(
            first_name="Other", last_name="User", email="other@x.com"
        )
        event2 = Event.objects.create(
            title="Event2", date=timezone.now() + timedelta(days=10), location="X", capacity=5
        )
        Registration.objects.create(event=self.event, participant=self.own_participant)
        Registration.objects.create(event=event2, participant=other_participant)

        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/registrations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        emails = [r["participant_email"] for r in resp.data]
        self.assertTrue(all(e == self.user.email for e in emails))

    def test_regular_user_cannot_delete_registration(self):
        registration = Registration.objects.create(event=self.event, participant=self.own_participant)
        self.client.force_authenticate(user=self.user)
        resp = self.client.delete(f"/api/registrations/{registration.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
