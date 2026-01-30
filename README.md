# MiniFilm SaaS REST

MiniFilm is a SaaS-style demo with a Vite SPA and an Express REST API secured by AWS Cognito (OAuth 2.0 Authorization Code + PKCE).

## Architecture
- **Client**: Vite SPA served on port **5173**
- **Server**: Express API on port **3000**
- **Auth**: Cognito Hosted UI issues access tokens
- **API Auth**: Server validates Cognito access tokens via JWKS

## Repository structure
```
client/   # Vite SPA (index.html, callback.html, OIDC config)
server/   # Express API (routes, middleware)
```

## Cognito Hosted UI setup (required)
App client settings:
- **Callback URL**: `http://localhost:5173/callback.html`
- **Sign-out URL**: `http://localhost:5173/`
- **OAuth flow**: Authorization code grant (PKCE)
- **Scopes**: `openid`, `email`, `profile`
- **Identity provider**: Cognito user pool
- **Client type**: public (no client secret)

Hosted UI supports **Sign up** automatically when self-service sign-up is enabled.

## Environment
Create `.env` in the repo root:
```
PORT=3000
COGNITO_REGION=your_region
COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_app_client_id
```

## Run locally (dev)
1) Install dependencies:
   - `npm install`
2) Start API:
   - `npm run dev`
3) Start UI:
   - `npm run client`
4) Open:
   - `http://localhost:5173/`

## Run with Docker Compose
1) Ensure `.env` is present (see Environment).
2) Build and run:
   - `docker compose up --build`
3) Open:
   - `http://localhost:5173/`

## UI actions
- **Sign In**: Redirects to Cognito Hosted UI
- **Create account**: Hosted UI sign-up screen
- **Health Check**: GET `/api/healthz`
- **Call API**: GET `/api/films`
- **Create Film**: POST `/api/films` with a JSON body

## API endpoints
- `GET /healthz` → `ok`
- `GET /films` → list films for the authenticated user
- `POST /films` → create a film `{ "title": "..." }`
- `DELETE /films/:id` → admin-only (Cognito group `admin`)

## Dev proxy vs. Docker proxy
- **Dev**: Vite proxies `/api/*` to `http://localhost:3000`
- **Docker**: Nginx proxies `/api/*` to the `server` container

## Build and publish images (GitHub Actions)
Workflow: `.github/workflows/publish.yml`
- Builds server and client images
- Publishes to GHCR with `latest` + commit SHA tags

## Troubleshooting
- **Invalid request from Hosted UI**: client ID or redirect URI mismatch.
- **Not signed in after redirect**: confirm `callback.html` is built (Docker uses multi-input build).
- **/api/* returns HTML**: ensure Nginx proxy in `client/nginx.conf` is active.

## Notes
- `.env` is gitignored; never commit secrets.
- This repo is designed for Topic 4: SaaS apps with REST + OAuth 2.0.
