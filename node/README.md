# Node.js + Express Comparative Backend

This folder is the comparative backend workspace for Lab 8.

It is intentionally smaller than the Django backend and it focus on:

- one or two entities
- CRUD routes
- database connection
- basic middleware and error handling
- Django vs Express comparison notes

## Run

Use Node.js 22 for this backend because `better-sqlite3` is a native dependency.
On macOS with Homebrew:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

```bash
npm install
npm run dev
```
