<!-- Frontend developer: Mehdi AGHAEI -->
# EventHub Frontend

This folder contains the EventHub React SPA for the EventHub project.

The frontend is organized around reusable folders so the application is easier to extend, maintain, and connect to the Django API.

## What The Frontend Includes

- protected application shell with session guard
- login page plus reusable auth components
- dashboard overview page
- events workspace with CRUD form and filters
- event details page with registration management
- participants workspace with CRUD and search
- centralized API service layer and shared utilities
- responsive layout for desktop and mobile screens

## Main Entry Points

- `src/main.jsx`: React bootstrap
- `src/App.jsx`: main application orchestration
- `src/index.css`: global CSS entry point
- `src/styles.js`: shared class name helpers

## Folder Structure

```text
src/
  HOC/
    withSessionGuard.jsx
  assets/
  components/
    auth/
      LoginForm.jsx
      RegisterForm.jsx
    cards/
    common/
    event/
    header/
  constants/
  pages/
  services/
  styles/
    app.css
    theme.css
  utils/
  App.jsx
  index.css
  main.jsx
  styles.js
```

## Architecture Notes

- `components/auth` contains the reusable login and register forms
- `components/event` contains event CRUD, filtering, and registration UI pieces
- `components/header` contains the main app shell and navigation
- `pages` composes the screen-level flows
- `services` isolates API requests from page logic
- `constants` stores shared routes and app-level configuration
- `utils` stores formatting, routing, storage, and workspace helpers
- `HOC` contains the higher-order session guard component

## Environment

Use `VITE_API_BASE_URL` to point the SPA to the Django backend.

Default local value:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

## Current Integration Status

The frontend is connected to the merged Django backend.

- Django API base URL is configurable through `VITE_API_BASE_URL`
- JWT login, refresh, and profile loading are wired through `src/services/authService.js`
- session persistence is handled in the browser through `localStorage`
- API calls are centralized in `src/services/`
- registration, events, participants, and dashboard data are loaded from the live backend routes


<!-- some test users -->
Admin: soroosh_admin / AdminPass123!
Viewer: maksym / ViewerPass123!
