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

## Report Quick Start

```bash
cd report
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```
