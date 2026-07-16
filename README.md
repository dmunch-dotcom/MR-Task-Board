# Minutemen Racing Tasks — MongoDB Atlas edition

The backend now persists boards/tasks in MongoDB Atlas via Mongoose instead
of a local `data.json` file. `index.html` (the front-end) is unchanged — it
still just calls `GET /api/data` and `POST /api/data`, so no client code had
to change.

## What changed

- `db.js` — connects to MongoDB Atlas using Mongoose.
- `models/Board.js` — a `Board` schema with embedded `tasks`, matching the
  exact JSON shape the front-end already expects.
- `index.js` — `/api/data` now reads/writes through Mongoose instead of
  `fs.readFile`/`fs.writeFile`.
- `scripts/migrate-json-to-mongo.js` — optional one-off script to import an
  existing `data.json` into Atlas.

## Setup

1. **Create an Atlas cluster** (the free M0 tier is fine) at
   https://cloud.mongodb.com, add a database user, and allow your IP (or
   `0.0.0.0/0` for quick testing) under Network Access.
2. **Get your connection string**: Database → Connect → Drivers → copy the
   `mongodb+srv://...` URI.
3. **Configure env vars**:
   ```bash
   cp .env.example .env
   # edit .env and paste your connection string into MONGODB_URI
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **(Optional) Import existing data**, if you have a `data.json` from the
   old version of this app:
   ```bash
   node scripts/migrate-json-to-mongo.js /path/to/data.json
   ```
6. **Run it**:
   ```bash
   npm start
   ```
   Then open http://localhost:3000/index.html.

## Data model

Each MongoDB document in the `boards` collection looks like:

```json
{
  "id": "t123abc",
  "name": "Product Launch",
  "tasks": [
    {
      "id": "t456def",
      "title": "Book the venue",
      "description": "",
      "due": "2026-08-01",
      "status": "not-started",
      "assignee": ""
    }
  ],
  "order": 0
}
```

`order` is internal-only (used to preserve tab order across saves) and is
stripped out before the JSON is sent to the browser, so the API response
shape is identical to the old file-based version.

`POST /api/data` still accepts the full boards array and treats it as the
source of truth for that request: any board present gets upserted, and any
board missing from the payload is deleted from MongoDB — matching the old
"overwrite the whole file" behavior.
