# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## VPS deployment

Use Node.js 22 or newer and a reachable MongoDB instance. Build the frontend and start the combined Express, Socket.IO, and static frontend server:

```sh
npm ci
npm run build
NODE_ENV=production npm start
```

Configure these environment variables in the VPS service manager (do not commit them):

- `PORT`: port exposed to the reverse proxy (defaults to `5000`).
- `MONGODB_URI`: production MongoDB connection string.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: separate random secrets, at least 32 characters each.
- `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`: used only to create the first admin when the database has no users; password must be at least 12 characters.
- `GEMINI_API_KEY`: enables contextual Gemini replies; `GEMINI_MODEL` defaults to `gemini-3.6-flash`.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, and `EMAIL_FROM`: required for password-reset email.

Point the reverse proxy to the Node port and enable WebSocket upgrades for `/socket.io/`. The built frontend and client-side routes are served by the same Node process.

For Facebook Messenger, configure the Meta callback as `https://<your-domain>/api/webhooks/facebook`, use the same `FB_VERIFY_TOKEN` during webhook verification, subscribe the Page to the `messages` field, and grant the app `pages_messaging`. Set `FB_PAGE_ACCESS_TOKEN` and `FB_APP_SECRET` on the server. Messenger PSIDs are always stored and searchable; profile names and pictures require the corresponding Meta profile-access approval for the Page.

## Social sign-in

Google, Facebook, and GitHub sign-in are available on both the login and signup pages. Each provider creates a user on first sign-in and links subsequent sign-ins to the same verified email. Set the matching client ID and client secret in the server environment; never commit these values.

For local development, register these callback URLs in each provider's OAuth application. These examples use the `.env.example` port `5000`; replace it with the `PORT` value from your `.env` if different:

- `http://localhost:5000/api/auth/oauth/google/callback`
- `http://localhost:5000/api/auth/oauth/facebook/callback`
- `http://localhost:5000/api/auth/oauth/github/callback`

Set `CLIENT_URL=http://localhost:5173`. In development, the API callback defaults to `http://localhost:<PORT>`; `OAUTH_CALLBACK_BASE_URL` can override it. For a public deployment, set `OAUTH_CALLBACK_BASE_URL` to the HTTPS API origin and register the matching HTTPS callback URLs. If the frontend and API use different origins, set `VITE_API_URL=https://<api-origin>/api` so the one-time OAuth exchange uses the same API host that issued its secure cookie. Include the frontend origin in `CORS_ALLOWED_ORIGINS`.

Set the provider credentials using `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET`, `OAUTH_FACEBOOK_CLIENT_ID`, `OAUTH_FACEBOOK_CLIENT_SECRET`, `OAUTH_GITHUB_CLIENT_ID`, and `OAUTH_GITHUB_CLIENT_SECRET`. Restart both the API and Vite after changing `.env`.

For Facebook, enable Facebook Login and request `email` and `public_profile`; Meta may require app review or tester roles before other users can sign in. Google requires an OAuth web client with the callback URL in its authorized redirect URIs. GitHub requires an OAuth App with the callback URL set as its Authorization callback URL. OAuth buttons remain disabled until both credentials for that provider are configured.
