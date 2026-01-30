# MiniFilm SaaS REST

Simple Cognito-backed demo with a Vite UI and an Express API.

## Structure
- `client/` UI (Vite)
- `server/` API (Express)

## Configure Cognito (Hosted UI)
App client settings:
- Callback URL: `http://localhost:5173/callback.html`
- Sign-out URL: `http://localhost:5173/`
- OAuth flow: Authorization code grant (PKCE)
- Scopes: `openid`, `email`, `profile`
- Identity provider: Cognito user pool
- Client type: public (no client secret)

## Environment
Create `.env` in the repo root:
```
PORT=3000
COGNITO_REGION=your_region
COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_app_client_id
```

## Run
1) Install deps: `npm install`
2) Start API: `npm run dev`
3) Start UI: `npm run client`
4) Open: `http://localhost:5173/`

## Test
- Health check: click **Health Check** (hits `/api/healthz`)
- Sign in via Cognito Hosted UI
- Click **Call API** to fetch `/api/films`

## Notes
- UI calls `/api/*` which is proxied to `http://localhost:3000` via Vite.
- `.env` is gitignored; keep secrets out of the repo.
