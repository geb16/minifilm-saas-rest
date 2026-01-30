# MiniFilm SaaS REST — Notes (Topic 4 / Lesson 1 + Lesson 2)

This note is a complete, step-by-step, walkthrough of the MiniFilm SaaS REST project. It covers concepts, code structure, and the exact sequence to go from zero to a working, professional-grade setup.

---

## 0) What this project is
MiniFilm is a simple SaaS-style REST API with a separate SPA UI. Authentication is delegated to AWS Cognito via OAuth 2.0 Authorization Code + PKCE. The UI gets tokens from Cognito and uses the access token to call the REST API.

Core learning goals:
- Understand distributed systems vs. non-distributed systems.
- Understand sync vs. async interactions.
- Implement access delegation with OAuth 2.0 (Cognito Hosted UI).
- Build and test a minimal SaaS REST API with protected routes.

---

## 1) Conceptual foundations (Lesson 1)

### 1.1 Distributed Systems (Lecture 1)
- A distributed system is a system where components run on separate processes or machines and coordinate over a network.
- In MiniFilm:
  - UI runs on one server (Vite dev server, port 5173).
  - API runs on another server (Express, port 3000).
  - Auth is delegated to Cognito (cloud service).
- This is a real-world distributed setup: UI, API, and Identity Provider are separate services.

### 1.2 Distributed systems technology (Lecture 2)
- Communication happens over HTTP and JSON.
- Token-based authentication decouples identity from the API:
  - Cognito issues tokens.
  - API verifies tokens.
  - API never stores user passwords.

### 1.3 Distributed vs. non-distributed (Lecture 3)
- Non-distributed: UI + API + auth in one process with local sessions.
- Distributed: separate UI, API, and auth provider. This is the SaaS reality.
- MiniFilm is distributed by design.

### 1.4 Synchronous vs. asynchronous (Lecture 4)
- Sync example: browser waits for `/films` response before rendering data.
- Async example: OAuth redirect flow is asynchronous:
  - UI redirects to Cognito.
  - Cognito redirects back to callback.
  - UI resumes with tokens after the redirect.

### 1.5 Access delegation with OAuth 2.0 (Lecture 5)
- OAuth 2.0 lets a user authorize the UI to access API resources without sharing passwords.
- Cognito Hosted UI is the Authorization Server.
- The API trusts access tokens issued by Cognito.
- PKCE protects public clients (SPAs) from authorization code interception.

---

## 2) Package structure and why it is organized this way

```
minifilm-saas-rest/
  client/                 # SPA UI (Vite)
    index.html
    callback.html
    main.js
    callback.js
    oidc.js
  server/                 # Express API
    server.js
    routes/
      films.routes.js
    middleware/
      oauth.js
      authz.js
    db/
      memory.js
    validation/
      schemas.js
  vite.config.js          # Vite config + proxy
  .env                    # local env (gitignored)
  .env.example            # template for env
  package.json
  README.md
```

Rationale:
- Clear separation of client and server code.
- Easy deployment: UI and API can be deployed independently.
- Avoids mixed frontend/backend in one folder, reducing confusion.

---

## 3) Zero-to-hero build sequence (Lab 4)

### Step 1 — Create a new REST application (Lab 4, Task 1)
1) Initialize a Node project:
   - `npm init -y`
2) Install dependencies for the API:
   - `express`, `cors`, `helmet`, `dotenv`, `aws-jwt-verify`, `zod`
3) Install dev dependencies:
   - `nodemon` for API reloads
   - `vite` for the UI dev server

### Step 2 — Create the API (server)
1) Build an Express server:
   - `server/server.js`
2) Add JSON parsing and security middleware:
   - `app.use(express.json())`
   - `app.use(helmet())`
   - `app.use(cors())`
3) Add a health endpoint:
   - `GET /healthz` returns `ok`
4) Create protected resources:
   - `GET /films` (requires Cognito access token)
   - `POST /films` (requires Cognito access token)
   - `DELETE /films/:id` (requires `admin` role)

### Step 3 — Add Cognito verification (API)
1) Use AWS `aws-jwt-verify`:
   - `server/middleware/oauth.js`
2) Validate access tokens:
   - Checks `userPoolId` and `clientId`
   - Attaches the JWT payload to `req.user`
3) Add role checks:
   - `server/middleware/authz.js` checks `cognito:groups`

Why it matters:
- The API never stores passwords.
- It trusts tokens issued by Cognito only.

### Step 4 — Create the UI (client)
1) `client/index.html`:
   - A clean UI with Sign In, Log Out, and API controls
2) `client/oidc.js`:
   - Configures Cognito for OIDC (authority, client_id, redirect_uri)
3) `client/main.js`:
   - `signinRedirect()` sends user to Cognito Hosted UI
   - Fetches tokens from `oidc-client-ts`
   - Calls `/api/films` with Bearer token
4) `client/callback.html` + `client/callback.js`:
   - Handles OAuth redirect and stores tokens

### Step 5 — Configure OAuth (Cognito Hosted UI)
1) Allowed callback URLs:
   - `http://localhost:5173/callback.html`
2) Allowed sign-out URLs:
   - `http://localhost:5173/`
3) OAuth 2.0 grant types:
   - Authorization Code Grant (PKCE)
4) OIDC scopes:
   - `openid`, `email`, `profile`
5) Identity providers:
   - Cognito user pool
6) Client type:
   - Public (no client secret)

### Step 6 — Add Vite proxy (clean local dev)
1) `vite.config.js`:
   - Proxies `/api/*` → `http://localhost:3000`
2) UI calls `/api/films` instead of hardcoding `http://localhost:3000`
3) No CORS problems in dev

### Step 7 — Run and test (Lab 4, Part 1)
1) Install dependencies:
   - `npm install`
2) Start API:
   - `npm run dev`
3) Start UI:
   - `npm run client`
4) Open UI:
   - `http://localhost:5173/`
5) Click **Sign In**:
   - Redirects to Cognito Hosted UI
6) Complete login:
   - Redirects to `callback.html`
   - Tokens stored by `oidc-client-ts`
7) Click **Health Check**:
   - Calls `/api/healthz`, expects `ok`
8) Click **Call API**:
   - Calls `/api/films`, expects `[]` (empty list) at first

---

## 4) Code-level walkthrough (what each file does)

### `client/oidc.js`
- Configures Cognito OIDC:
  - `authority`: Cognito issuer URL
  - `client_id`: your app client id
  - `redirect_uri`: local callback URL
  - `response_type`: `code` (PKCE)
  - `scope`: `openid email profile`
- Exposes `signOutRedirect()`:
  - Redirects to Cognito logout URL

### `client/main.js`
- Sign in:
  - `userManager.signinRedirect()`
- Sign out:
  - `signOutRedirect()`
- API calls:
  - `fetch("/api/films")` with `Authorization: Bearer <token>`
- Health check:
  - `fetch("/api/healthz")`

### `client/callback.js`
- Exchanges auth code for tokens:
  - `userManager.signinCallback()`
- Redirects back to `/`

### `server/server.js`
- Express server
- Middleware: `helmet`, `cors`, `express.json()`
- Routes:
  - `/healthz`
  - `/films`

### `server/middleware/oauth.js`
- Uses `CognitoJwtVerifier`
- Validates access token signature and claims
- Attaches `req.user`

### `server/middleware/authz.js`
- Optional role check:
  - Looks for `cognito:groups` or `role` in token

### `server/routes/films.routes.js`
- `GET /films`:
  - Returns films for the authenticated user
- `POST /films`:
  - Creates a film for the authenticated user
- `DELETE /films/:id`:
  - Only users in admin group can delete

---

## 5) Environment and security notes

- `.env` is gitignored. Do not commit secrets.
- The API only needs:
  - `PORT`
  - `COGNITO_REGION`
  - `COGNITO_USER_POOL_ID`
  - `COGNITO_CLIENT_ID`
- The UI embeds Cognito values in `client/oidc.js`:
  - This is normal for public SPA apps.
- Always use Authorization Code + PKCE for SPAs.

---

## 6) Troubleshooting (most common issues)

1) **Cognito “invalid_request”**
   - Usually wrong client_id or redirect_uri mismatch.
   - Confirm client_id in `client/oidc.js`.
   - Confirm Hosted UI callback/sign-out URLs.

2) **Login page doesn’t open**
   - Hosted UI domain wrong.
   - Copy the exact domain from Cognito → Domain.

3) **API calls fail**
   - API not running (`npm run dev`).
   - Token missing (not signed in).
   - `/api/*` proxy not active (Vite not running).

4) **Port mismatch**
   - UI runs on 5173, API on 3000.
   - Vite config enforces port 5173.

---

## 7) Why this is SaaS‑grade
- Separate UI and API services.
- OAuth 2.0 delegated access (no passwords in API).
- Token verification done server‑side.
- Clean project structure for maintainability.
- Health checks and consistent routes.

---

## 8) Quick reference commands

Install:
```
npm install
```

Run API:
```
npm run dev
```

Run UI:
```
npm run client
```

Open UI:
```
http://localhost:5173/
```
