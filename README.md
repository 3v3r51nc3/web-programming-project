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

## Django Quick Start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

## Node.js Quick Start

```bash
cd node
npm install
npm run dev
```

## Report Quick Start

```bash
cd report
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```
