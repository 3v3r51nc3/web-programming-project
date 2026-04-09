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

## Install Node.js 22

### macOS with Homebrew

Install Node 22:

```bash
brew install node@22
```

Use it in the current terminal:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

Check the active version:

```bash
node -v
```

It should show `v22.x.x`.

### If you use nvm

Install Node 22:

```bash
nvm install 22
```

Use Node 22:

```bash
nvm use 22
```

If the project already has `.nvmrc`, you can also run:

```bash
nvm use
```

### Linux or Windows

Install Node.js 22 LTS from:

```text
https://nodejs.org/
```

## Start the backend

After Node 22 is active, run:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Postman testing

Import this collection into Postman to test the whole Node API:

[`postman/EventHub-Node-API.postman_collection.json`](/Users/sigmoid/Desktop/Coding/GitHub/S2/web-programming-project/node/postman/EventHub-Node-API.postman_collection.json)

Default collection variable:

- `baseUrl = http://localhost:3001/api/`

Suggested run order:

1. `Health`
2. `Events`
3. `Participants`
4. `Errors`
