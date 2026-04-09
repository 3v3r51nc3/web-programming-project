# EventHub Django API Documentation

Base URL in local development:

```text
http://localhost:8000/api/
```

Authentication uses JWT tokens.

- Public registration: `POST /api/auth/register/`
- Login and token creation: `POST /api/auth/token/`
- Token refresh: `POST /api/auth/token/refresh/`
- Current user profile: `GET/PATCH /api/auth/me/`

Use this header for protected endpoints:

```http
Authorization: Bearer <access_token>
```

## Permission Summary

| Resource | Read access | Write access |
|---|---|---|
| `events` | public | admin only |
| `participants` | authenticated users | admin only |
| `registrations` | authenticated users | admin only |
| `auth/me` | authenticated user | authenticated user |
| `auth/register` | public | public |
| `auth/token` | public | public |
| `auth/token/refresh` | public | public |

Notes:

- Non-admin authenticated users can read the participant directory.
- Non-admin authenticated users can read only their own registrations.
- When a normal authenticated user accesses participants or registrations, the backend automatically synchronizes a `Participant` record from their user profile when possible.

## Data Models

### Event

| Field | Type | Notes |
|---|---|---|
| `id` | integer | read only |
| `title` | string | required |
| `description` | string | optional |
| `date` | datetime | required, must be in the future |
| `location` | string | required |
| `capacity` | integer | required, minimum `1` |
| `created_at` | datetime | read only |
| `confirmed_registrations_count` | integer | read only, computed |

### Participant

| Field | Type | Notes |
|---|---|---|
| `id` | integer | read only |
| `first_name` | string | required |
| `last_name` | string | required |
| `email` | string | required, unique |
| `created_at` | datetime | read only |

### Registration

| Field | Type | Notes |
|---|---|---|
| `id` | integer | read only |
| `event` | integer | required, event id |
| `participant` | integer | required, participant id |
| `status` | string | `confirmed` or `cancelled`, default `confirmed` |
| `registered_at` | datetime | read only |
| `event_title` | string | read only |
| `participant_email` | string | read only |
| `participant_name` | string | read only |

## Authentication Endpoints

### `POST /api/auth/register/`

Creates a new Django user and automatically creates or syncs the matching participant record by email.

Request body:

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "password": "SecurePass123!",
  "password2": "SecurePass123!"
}
```

Success response: `201 Created`

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User"
}
```

Common validation errors:

- password mismatch
- duplicate username
- duplicate email
- password rejected by Django password validators

### `POST /api/auth/token/`

Authenticates a user and returns JWT tokens.

Request body:

```json
{
  "username": "newuser",
  "password": "SecurePass123!"
}
```

Success response: `200 OK`

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

### `POST /api/auth/token/refresh/`

Request body:

```json
{
  "refresh": "<refresh_token>"
}
```

Success response: `200 OK`

```json
{
  "access": "<new_access_token>"
}
```

### `GET /api/auth/me/`

Returns the authenticated user profile.

Success response: `200 OK`

```json
{
  "id": 4,
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "is_staff": false
}
```

### `PATCH /api/auth/me/`

Updates the authenticated user profile.

Example request body:

```json
{
  "first_name": "Updated"
}
```

## Event Endpoints

### `GET /api/events/`

Returns all events. Public endpoint.

Example response:

```json
[
  {
    "id": 1,
    "title": "Workshop",
    "description": "Intro session",
    "date": "2026-05-20T14:00:00Z",
    "location": "Paris",
    "capacity": 30,
    "created_at": "2026-04-09T08:00:00Z",
    "confirmed_registrations_count": 12
  }
]
```

### `GET /api/events/<id>/`

Returns one event. Public endpoint.

### `POST /api/events/`

Creates an event. Admin only.

Request body:

```json
{
  "title": "Workshop",
  "description": "Intro session",
  "date": "2026-05-20T14:00:00Z",
  "location": "Paris",
  "capacity": 30
}
```

Common validation errors:

- event date is in the past
- capacity is less than `1`

### `PATCH /api/events/<id>/`

Updates part of an event. Admin only.

### `DELETE /api/events/<id>/`

Deletes an event. Admin only.

## Participant Endpoints

### `GET /api/participants/`

Returns the participant directory. Authenticated users only.

### `GET /api/participants/<id>/`

Returns one participant. Authenticated users only.

### `POST /api/participants/`

Creates a participant. Admin only.

Request body:

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com"
}
```

Common validation errors:

- duplicate email

### `PATCH /api/participants/<id>/`

Updates a participant. Admin only.

### `DELETE /api/participants/<id>/`

Deletes a participant. Admin only.

## Registration Endpoints

### `GET /api/registrations/`

Authenticated users only.

- Admin users receive all registrations.
- Normal authenticated users receive only registrations linked to their own participant profile.

Example response:

```json
[
  {
    "id": 3,
    "event": 1,
    "participant": 5,
    "status": "confirmed",
    "registered_at": "2026-04-09T10:00:00Z",
    "event_title": "Workshop",
    "participant_email": "newuser@example.com",
    "participant_name": "New User"
  }
]
```

### `GET /api/registrations/<id>/`

Authenticated users only.

- Admin users can access any registration.
- Normal authenticated users can access only their own registration detail.

### `POST /api/registrations/`

Creates a registration. Admin only.

Request body:

```json
{
  "event": 1,
  "participant": 5,
  "status": "confirmed"
}
```

Business rules enforced by the serializer:

- cannot register for an event in the past
- same participant cannot be registered twice for the same event
- confirmed registrations cannot exceed event capacity
- cancelled registrations do not count toward capacity

### `PATCH /api/registrations/<id>/`

Updates a registration, for example changing status from `confirmed` to `cancelled`. Admin only.

Example request body:

```json
{
  "status": "cancelled"
}
```

### `DELETE /api/registrations/<id>/`

Deletes a registration. Admin only.

## Common Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | successful read or update |
| `201 Created` | successful creation |
| `204 No Content` | successful deletion |
| `400 Bad Request` | validation failed |
| `401 Unauthorized` | missing or invalid authentication |
| `403 Forbidden` | authenticated but not allowed |
| `404 Not Found` | object does not exist or is not visible to that user |

## Manual Testing Examples

Register:

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username":"newuser",
    "email":"newuser@example.com",
    "first_name":"New",
    "last_name":"User",
    "password":"SecurePass123!",
    "password2":"SecurePass123!"
  }'
```

Login:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"SecurePass123!"}'
```

List events:

```bash
curl http://localhost:8000/api/events/
```

Create an event as admin:

```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title":"Workshop",
    "description":"Intro session",
    "date":"2026-05-20T14:00:00Z",
    "location":"Paris",
    "capacity":30
  }'
```
