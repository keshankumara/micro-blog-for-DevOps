
# Backend README

This folder contains the Express + Mongoose backend for the micro-blog project. It provides simple authentication (JWT via httpOnly cookie), posts, and user endpoints used by the frontend.

## Quick start

1. Copy the example environment file and fill values:

```powershell
cd backend
Copy-Item .env.example .env
# then edit .env and set JWT_SECRET and (optionally) MONGO_URI
```

2. Install dependencies and start in development mode:

```powershell
npm install
npm run dev
```

By default the server listens on port 5000. You can override with the PORT environment variable.

## Environment variables (.env)

Create a `.env` (copy from `.env.example`) with these entries:

- MONGO_URI - MongoDB connection string
- JWT_SECRET - secret used to sign JWT tokens (use a long random value in production)
- FRONTEND_URL - the frontend origin (used for CORS)
- PORT - port the server listens on (default: 5000)
- NODE_ENV - development|production

## Troubleshooting: EADDRINUSE (port already in use)

If you see an error like "EADDRINUSE: address already in use :::5000":

- Find the process listening on port 5000 (PowerShell):

```powershell
netstat -ano | Select-String ":5000"
# note the PID in the last column
```

- Stop the process by PID (PowerShell):

```powershell
Stop-Process -Id <PID> -Force
# or: taskkill /PID <PID> /F
```

- Or run the server on a different port temporarily:

```powershell
$env:PORT = 5001; npm run dev
```

## Frontend API URL

The frontend expects the API base URL in `VITE_API_URL`. If you run the backend on a non-default port, set `VITE_API_URL=http://localhost:<PORT>` in `frontend/.env` or when starting the frontend so requests go to the correct backend address.

## Security notes

- Do not commit real secrets. Keep `.env` out of version control.
- Use a strong `JWT_SECRET` in production and enable secure cookie flags when serving over HTTPS.

If you want, I can also add a short `backend/.env.example` for you with placeholder values.

## Docker (build & run)

Build a production image (will install only production dependencies):

```powershell
cd backend
docker build -t microblog-backend:latest .
```

Run the container (map the port and pass runtime environment variables):

```powershell
docker run -p 5000:5000 --env-file .env --rm --name microblog-backend microblog-backend:latest
```

Notes:
- The image expects the app entry at `src/server.js`. If you changed the server file path, update the Dockerfile CMD.
- Use `--env-file` or explicit `-e` flags to inject `MONGO_URI`, `JWT_SECRET`, etc. into the container.

