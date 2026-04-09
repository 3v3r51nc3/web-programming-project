# Django Backend Workspace

This folder contains the main Django backend for EventHub.

## Scope

- relational models
- Django REST API
- business rules and validation
- authentication and permissions
- backend tests

## Run

```bash
cd /Users/sorooshaghaei/Desktop/Paris_cite_projects/web-programming-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

## API Documentation

The API documentation is in [API_DOCUMENTATION.md](/Users/sigmoid/Desktop/Coding/GitHub/S2/web-programming-project/backend/API_DOCUMENTATION.md).

## Main Next Steps

- finish authentication and roles
- add tests
- finalize CORS and API integration with the frontend
