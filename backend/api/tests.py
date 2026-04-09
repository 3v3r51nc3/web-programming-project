# Backend developer: Maksym DOLHOV
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event, Participant, Registration
from .utils import sync_participant_for_user


class EventModelTest(TestCase):
    def _future_event(self, **kwargs):
        defaults = {
            "title": "Test Event",
            "date": timezone.now() + timedelta(days=1),
            "location": "Paris",
            "capacity": 50,
        }
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
        participant = Participant.objects.create(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
        )
        self.assertEqual(str(participant), "Alice Smith (alice@example.com)")

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
            first_name="Bob",
            last_name="Jones",
            email="bob@example.com",
        )

    def test_default_status_is_confirmed(self):
        registration = Registration.objects.create(event=self.event, participant=self.participant)
        self.assertEqual(registration.status, "confirmed")

    def test_str(self):
        registration = Registration.objects.create(event=self.event, participant=self.participant)
        self.assertIn("Bob Jones", str(registration))
        self.assertIn("Meetup", str(registration))

    def test_unique_together_prevents_duplicate(self):
        Registration.objects.create(event=self.event, participant=self.participant)
        with self.assertRaises(Exception):
            Registration.objects.create(event=self.event, participant=self.participant)


class AuthTests(APITestCase):
    REGISTER_URL = "/api/auth/register/"
    TOKEN_URL = "/api/auth/token/"
    REFRESH_URL = "/api/auth/token/refresh/"
    ME_URL = "/api/auth/me/"

    def test_register_creates_user_and_participant(self):
        response = self.client.post(
            self.REGISTER_URL,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "first_name": "New",
                "last_name": "User",
                "password": "SecurePass123!",
                "password2": "SecurePass123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertTrue(Participant.objects.filter(email="newuser@example.com").exists())

    def test_register_password_mismatch(self):
        response = self.client.post(
            self.REGISTER_URL,
            {
                "username": "user2",
                "email": "user2@example.com",
                "password": "GoodPass1!",
                "password2": "Different1!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        User.objects.create_user(username="taken", password="pass1234!")
        response = self.client.post(
            self.REGISTER_URL,
            {
                "username": "taken",
                "email": "x@example.com",
                "password": "GoodPass1!",
                "password2": "GoodPass1!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_rejected(self):
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="GoodPass1!",
        )
        response = self.client.post(
            self.REGISTER_URL,
            {
                "username": "new-account",
                "email": "existing@example.com",
                "password": "GoodPass1!",
                "password2": "GoodPass1!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_obtain_token(self):
        User.objects.create_user(username="tokenuser", password="GoodPass1!")
        response = self.client.post(
            self.TOKEN_URL,
            {"username": "tokenuser", "password": "GoodPass1!"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_token(self):
        User.objects.create_user(username="refreshuser", password="GoodPass1!")
        tokens = self.client.post(
            self.TOKEN_URL,
            {"username": "refreshuser", "password": "GoodPass1!"},
        ).data
        response = self.client.post(self.REFRESH_URL, {"refresh": tokens["refresh"]})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_returns_current_user(self):
        user = User.objects.create_user(username="meuser", password="GoodPass1!")
        self.client.force_authenticate(user=user)
        response = self.client.get(self.ME_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "meuser")

    def test_me_unauthenticated_returns_401(self):
        response = self.client.get(self.ME_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_patch_updates_profile(self):
        user = User.objects.create_user(username="patchme", password="GoodPass1!")
        self.client.force_authenticate(user=user)
        response = self.client.patch(self.ME_URL, {"first_name": "Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Updated")


class EventTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", password="pass!", is_staff=True)
        self.user = User.objects.create_user(
            username="regular",
            email="regular@example.com",
            password="pass!",
        )
        self.valid_payload = {
            "title": "Workshop",
            "date": (timezone.now() + timedelta(days=3)).isoformat(),
            "location": "Paris",
            "capacity": 30,
        }

    def test_list_events_public(self):
        Event.objects.create(
            title="Public workshop",
            date=timezone.now() + timedelta(days=1),
            location="Paris",
            capacity=10,
        )
        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_event_detail_public(self):
        event = Event.objects.create(
            title="Detailed event",
            date=timezone.now() + timedelta(days=1),
            location="Paris",
            capacity=10,
        )
        response = self.client.get(f"/api/events/{event.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Workshop")

    def test_create_event_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_event_unauthenticated_forbidden(self):
        response = self.client.post("/api/events/", self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        response = self.client.patch(f"/api/events/{event_id}/", {"title": "Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated")

    def test_delete_event_admin(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        response = self.client.delete(f"/api/events/{event_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_event_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.admin)
        event_id = self.client.post("/api/events/", self.valid_payload).data["id"]
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/events/{event_id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_event_past_date_rejected(self):
        self.client.force_authenticate(user=self.admin)
        payload = dict(self.valid_payload, date=(timezone.now() - timedelta(days=1)).isoformat())
        response = self.client.post("/api/events/", payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_event_zero_capacity_rejected(self):
        self.client.force_authenticate(user=self.admin)
        payload = dict(self.valid_payload, capacity=0)
        response = self.client.post("/api/events/", payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_event_list_includes_confirmed_registration_count(self):
        participant = Participant.objects.create(
            first_name="Ada",
            last_name="Lovelace",
            email="ada@example.com",
        )
        event = Event.objects.create(
            title="Counted Event",
            date=timezone.now() + timedelta(days=2),
            location="Paris",
            capacity=10,
        )
        Registration.objects.create(
            event=event,
            participant=participant,
            status="confirmed",
        )
        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        counted_event = next(item for item in response.data if item["id"] == event.id)
        self.assertEqual(counted_event["confirmed_registrations_count"], 1)


class ParticipantTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="adminpt", password="pass!", is_staff=True)
        self.user = User.objects.create_user(
            username="userpt",
            email="userpt@example.com",
            password="pass!",
            first_name="User",
            last_name="Participant",
        )
        self.payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
        }

    def test_list_participants_unauthenticated_forbidden(self):
        response = self.client.get("/api/participants/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_participants_authenticated_user_sees_directory(self):
        Participant.objects.create(first_name="Other", last_name="Person", email="other@example.com")
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/participants/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = {participant["email"] for participant in response.data}
        self.assertIn("other@example.com", emails)
        self.assertIn(self.user.email, emails)

    def test_create_participant_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/participants/", self.payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_participant_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/participants/", self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_email_rejected(self):
        self.client.force_authenticate(user=self.admin)
        self.client.post("/api/participants/", self.payload)
        response = self.client.post(
            "/api/participants/",
            {"first_name": "John", "last_name": "Doe", "email": "jane@example.com"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_participant_admin(self):
        self.client.force_authenticate(user=self.admin)
        participant_id = self.client.post("/api/participants/", self.payload).data["id"]
        response = self.client.delete(f"/api/participants/{participant_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class RegistrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="adminreg",
            email="admin@hub.com",
            password="pass!",
            is_staff=True,
        )
        self.user = User.objects.create_user(
            username="userreg",
            email="userreg@hub.com",
            password="pass!",
            first_name="User",
            last_name="Regular",
        )
        self.other_user = User.objects.create_user(
            username="otheruserreg",
            email="otheruser@hub.com",
            password="pass!",
            first_name="Other",
            last_name="Member",
        )
        self.event = Event.objects.create(
            title="Summit",
            date=timezone.now() + timedelta(days=5),
            location="Nice",
            capacity=2,
        )
        self.participant = Participant.objects.create(
            first_name="Tom",
            last_name="Brown",
            email="tom@example.com",
        )
        self.own_participant = sync_participant_for_user(self.user)
        self.other_participant = sync_participant_for_user(self.other_user)

    def test_create_registration_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": self.participant.id},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "confirmed")

    def test_create_registration_unauthenticated_forbidden(self):
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": self.participant.id},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_viewer_cannot_create_registration(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": self.own_participant.id},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_registration_rejected(self):
        self.client.force_authenticate(user=self.admin)
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": self.participant.id})
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": self.participant.id},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_capacity_exceeded_rejected(self):
        self.client.force_authenticate(user=self.admin)
        first = Participant.objects.create(first_name="P1", last_name="L", email="p1@x.com")
        second = Participant.objects.create(first_name="P2", last_name="L", email="p2@x.com")
        third = Participant.objects.create(first_name="P3", last_name="L", email="p3@x.com")
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": first.id})
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": second.id})
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": third.id},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelled_registration_frees_capacity(self):
        self.client.force_authenticate(user=self.admin)
        first = Participant.objects.create(first_name="A", last_name="L", email="a@x.com")
        second = Participant.objects.create(first_name="B", last_name="L", email="b@x.com")
        third = Participant.objects.create(first_name="C", last_name="L", email="c@x.com")
        first_registration = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": first.id},
        ).data
        self.client.post("/api/registrations/", {"event": self.event.id, "participant": second.id})
        self.client.patch(
            f"/api/registrations/{first_registration['id']}/",
            {"status": "cancelled"},
        )
        response = self.client.post(
            "/api/registrations/",
            {"event": self.event.id, "participant": third.id},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_can_update_registration_status(self):
        registration = Registration.objects.create(event=self.event, participant=self.participant)
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/registrations/{registration.id}/",
            {"status": "cancelled"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelled")

    def test_viewer_cannot_patch_own_registration_status(self):
        registration = Registration.objects.create(event=self.event, participant=self.own_participant)
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/registrations/{registration.id}/",
            {"status": "cancelled"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_registration(self):
        registration = Registration.objects.create(event=self.event, participant=self.participant)
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f"/api/registrations/{registration.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_viewer_cannot_delete_own_registration(self):
        registration = Registration.objects.create(event=self.event, participant=self.own_participant)
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/registrations/{registration.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_sees_all_registrations(self):
        Registration.objects.create(event=self.event, participant=self.participant)
        Registration.objects.create(event=self.event, participant=self.own_participant)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/registrations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_viewer_sees_only_own_registrations(self):
        Registration.objects.create(event=self.event, participant=self.own_participant)
        Registration.objects.create(event=self.event, participant=self.other_participant)
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/registrations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["participant_email"], self.user.email)

    def test_viewer_cannot_view_other_users_registration_detail(self):
        registration = Registration.objects.create(event=self.event, participant=self.other_participant)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/registrations/{registration.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_viewer_can_view_own_registration_detail(self):
        registration = Registration.objects.create(event=self.event, participant=self.own_participant)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/registrations/{registration.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["participant_email"], self.user.email)
