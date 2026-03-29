# EventHub Workspace

Integrated full-stack project for Web Programming 2026.

## Project Layout

```text
web-programming-project/
  frontend/    React frontend workspace
  backend/     Django backend workspace
  node/        Node.js + Express comparative backend workspace
  report/      LaTeX report workspace
```

## Working Split

- Frontend work goes in `frontend/`
- Django backend work goes in `backend/`
- Node.js / Express comparative work goes in `node/`
- Report writing goes in `report/`

## Branches

- `main`: integrated branch containing the current project structure
- `soroosh_branch`: frontend-oriented branch
- `backend`: backend-oriented branch

## Frontend Quick Start

```bash
cd frontend
npm install
npm run dev
```

## Backend Quick Start

Both backends expose the same REST API (`/api/events`, `/api/participants`) and can run at the same time on different ports.

### Django (port 8000)

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000/api/`

### Node.js / Express (port 3001)

```bash
cd node
npm install
npm run dev
```

API available at `http://localhost:3001/api/`

### Running both at once

Open two terminals and run each quick start above in its own terminal. Both servers are independent and use separate SQLite databases (`backend/db.sqlite3` and `node/db.sqlite3`).

## Public Deployment

This repository is prepared for the following demo deployment shape:

- `frontend/` -> Vercel
- `backend/` -> Railway
- database -> SQLite on a Railway mounted volume at `/data/db.sqlite3`

### 1. Create the Railway backend

1. Create a new Railway project from this GitHub repository.
2. Add a volume and mount it at `/data`.
3. Set the service build command:

```bash
python backend/manage.py collectstatic --noinput
```

4. Set the service start command:

```bash
python backend/manage.py migrate && gunicorn backend.wsgi:application --chdir backend --bind 0.0.0.0:$PORT
```

5. Add these Railway environment variables:

```bash
DJANGO_SECRET_KEY=<strong-random-value>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-railway-domain>
DJANGO_CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-vercel-domain>
SQLITE_PATH=/data/db.sqlite3
```

6. Deploy the service and copy the public Railway URL.
7. Open a Railway shell and create the admin account:

```bash
python backend/manage.py createsuperuser
```

### 2. Create the Vercel frontend

1. Import the same GitHub repository into Vercel.
2. Set the project root to `frontend/`.
3. Use:

```bash
Build command: npm run build
Output directory: dist
```

4. Add this Vercel environment variable:

```bash
VITE_API_BASE_URL=https://<your-railway-domain>/api
```

5. Deploy and open the generated `*.vercel.app` URL.

### 4. Smoke-test the public site

1. Open the Vercel URL and confirm the login page loads.
2. Register a normal user and log in.
3. Confirm events, participants, and registrations load without CORS errors.
4. Log in with the Railway admin account and verify create, edit, and delete flows.
5. Restart or redeploy Railway and confirm the data still exists.

## Report Quick Start

```bash
cd report
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```
