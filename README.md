# opus-box

A listening journal for classical music lovers — browse composers, works, and
recordings, and log listening sessions with ratings and notes.

## Tech stack

- **Backend:** Python 3.13, FastAPI, SQLAlchemy, Alembic, Postgres, bcrypt, PyJWT
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, NextAuth.js
- **Data source:** [MusicBrainz](https://musicbrainz.org/) API, via `musicbrainzngs`

## Prerequisites

- Python 3.13
- Node.js
- Postgres running locally, with a database named `opusbox`

## Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://localhost/opusbox
SECRET_KEY=<any random string>
```

Create the tables and seed some data:

```bash
alembic upgrade head
python seed.py   # ingests Beethoven, Mozart, Bach + works/recordings from MusicBrainz — takes a few minutes
```

Run the API:

```bash
uvicorn main:app --reload
# http://localhost:8000, docs at http://localhost:8000/docs
```

## Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<any random string>
NEXT_PUBLIC_API_URL=http://localhost:8000   # optional, defaults to this
```

Run the app:

```bash
npm run dev
# http://localhost:3000
```

## Known gotchas

- Always `source venv/bin/activate` before running any backend command.
- On macOS, if `seed.py` fails with an SSL certificate error, run
  `/Applications/Python 3.13/Install Certificates.command`.
- Any new SQLAlchemy model must be imported in `backend/app/models/__init__.py`
  for relationship resolution to work.
