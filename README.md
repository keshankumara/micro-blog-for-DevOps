# Micro Blog for DevOps

A small micro-blog application intended for learning and demoing a typical DevOps workflow: a Vite + React frontend served by nginx and a Node/Express backend. This repository contains both frontend and backend code, Dockerfiles for each service, and a `docker-compose.yml` so you can run the full stack locally or as part of CI/CD.

---

## Table of contents

- Overview
- Architecture
- Quickstart (Docker Compose)
- Development
  - Backend
  - Frontend
- Environment variables
- Docker / Production notes
- Troubleshooting
- Next steps

---

## Overview

This project demonstrates a minimal micro-blog platform with a React frontend and an Express backend with MongoDB (see `backend/config/db.js`). The repository layout is:

```
frontend/   # Vite React app, built to static files and served by nginx
backend/    # Node + Express API
docker-compose.yml
README.md
```

Key goals:
- Keep the frontend and backend in separate containers
- Build small production images using multi-stage Dockerfiles
- Serve the frontend with nginx and proxy `/api` to the backend for same-origin calls

## Architecture

- Frontend: React + Vite (source in `frontend/src`). Production build is produced by `npm run build` and served by `nginx` in the frontend Dockerfile. `frontend/nginx.conf` contains an `/api` proxy to the backend service.
- Backend: Node 18 + Express (source in `backend/src`). A small health endpoint exists at `/health` and API routes are mounted under `/api`.
- Compose: `docker-compose.yml` builds both images and starts them on a common network (`micro-blog-network`).

## Quickstart (Docker Compose)

These steps assume Docker Desktop or a Docker Engine and Compose v2+ are installed and available in PowerShell.


1. From the repository root build and start the stack:

```powershell
# Build images and start services (single command)
docker compose up --build

# Start in detached mode (background)
docker compose up -d --build

# Follow logs for all services
docker compose logs -f

# Stop and remove containers, networks and default volumes
docker compose down
```

2. Open your browser to `http://localhost` (frontend) and the frontend will proxy API requests to the backend at `/api`.

Notes:
- Frontend listens on container port 80 and is mapped to host port 80 by the compose file.
- Backend listens on container port 5000 and is mapped to host port 5000.

## Development

You can run services independently during development.

### Backend (local dev)

1. cd into `backend`

2. Install only the MongoDB driver if you don't want to run a full `npm install`:

```powershell
cd backend
# install mongoose if it's missing
npm install mongoose

# (Optional) to install all dependencies
# npm install
```

3. Start the dev server using nodemon (the project also exposes `npm run dev` which uses nodemon):

```powershell
# run nodemon directly
npx nodemon src/server.js

# Or use the npm script
# npm run dev
```

4. Backend dev server runs on port `5000` by default. You can set environment variables in a local `.env` (see Environment variables below).

### Frontend (local dev)

1. cd into `frontend`
2. Install dependencies and start Vite dev server:

```powershell
cd frontend
npm install
npm run dev
```

3. By default Vite serves on `http://localhost:5173`. During local dev set the API target with the env var `VITE_API_URL` (for example `http://localhost:5000/api`) so the client calls the backend directly instead of relying on nginx proxying.

Example (PowerShell):

```powershell
#$env:VITE_API_URL = 'http://localhost:5000/api'
npm run dev
```

## Environment variables

Recommended variables for the backend (put in `backend/.env` or your deployment secrets store):

- `PORT` - port backend listens on (default 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - used to configure CORS in development (default `http://localhost:5173`)

For the frontend dev server:
- `VITE_API_URL` - full API base (e.g. `http://localhost:5000/api`) when not using nginx proxy

Do NOT commit secrets to Git. Create a `.env.example` listing keys without values to help collaborators.

## Docker / Production notes

- Backend Dockerfile: `backend/Dockerfile` — multi-stage build that installs production dependencies, copies app files, switches to a non-root user, and runs `node src/server.js`.
- Frontend Dockerfile: `frontend/Dockerfile` — builds the Vite app and then copies the `dist/` into an nginx image. `frontend/nginx.conf` contains a proxy for `/api` to the backend container name `backend:5000` when running in compose.
- Healthcheck: The backend exposes a lightweight `/health` endpoint used for container health checks.

Important production considerations:
- Provide environment variables (DB, secrets) from a secure store or `env_file` in your orchestrator.
- Don't bind-mount source into the production image. Use the image's files (no host volumes) so containers are immutable and reproducible.

## Troubleshooting

1. Frontend shows no posts but backend is running

 - If you're running with `docker compose` ensure you rebuilt the frontend image after changing `nginx.conf`:

```powershell
docker compose -f .\docker-compose.yml build frontend
docker compose -f .\docker-compose.yml up -d
```

 - Check browser devtools (Network tab) for requests to `/api/posts`. If requests return 4xx/5xx, inspect backend logs:

```powershell
docker compose logs -f backend
```

 - If you see errors like `Cannot find module '/app/backend'` this usually means the container was started with an incorrect working directory, a wrong `CMD`, or a mount from the host that hides image files. Run `docker compose ps -a` and `docker inspect <container>` to check command and mount points.

2. CORS / credentials issues

 - The project defaults to proxied same-origin requests (nginx forwards `/api`), which avoids browser CORS. If you run the frontend dev server and call the backend directly, set `VITE_API_URL` and ensure the backend `FRONTEND_URL` CORS value matches your dev origin.

3. Healthcheck failing

 - Confirm the backend responds on `/health` and that the port is set to `5000` or whatever value you configured.

## Next steps and improvements

- Add a `backend/.env.example` and `frontend/.env.example` to document required env vars.
- Add CI to build and push images (GitHub Actions, GitLab CI, etc.).
- Add a small entrypoint wait script for stricter startup ordering if needed, although the nginx proxy + retries in the frontend are usually sufficient.

## Where to look in the repo

- Frontend source: `frontend/src`
- Frontend nginx config: `frontend/nginx.conf`
- Backend source: `backend/src`
- Backend Dockerfile: `backend/Dockerfile`
- Compose orchestration: `docker-compose.yml`

---

If you'd like, I can also:
- add `.env.example` files,
- add a short CI workflow to build/push images,
- or add a small troubleshooting script to check container health and endpoints.

Happy to make those next edits — tell me which you'd like me to do. 
*# micro-blog-for-DevOps
This is a small web application where users can write short posts
