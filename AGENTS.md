# AGENTS.md - PadelManager UI

## Commands
- `npm run dev` - Start dev server on port 5000
- `npm run build` - Production build (outputs to `dist/`)
- `npm run build:dev` - Dev build with development mode
- `npm run lint` - Run ESLint

## Environment Required
Create `.env` (or copy `.env.development`):
- `VITE_AUTH_CLIENT_ID`
- `VITE_AUTH_TENANT_ID`
- `VITE_AUTH_REDIRECT_URI`
- `VITE_AUTHORITY_URI`
- `VITE_API_BASE_URL`
- `VITE_AUTH_SCOPES`
- `VITE_AUTH_RESPONSE_TYPE`

## Architecture
- React 19 + TypeScript + Vite (SPA)
- Auth: Azure AD B2C via MSAL (`@azure/msal-browser`, `@azure/msal-react`)
- API: `https://api.lagiovps.cloud`
- Entrypoint: `src/main.tsx` → `src/App.tsx`
- Auth config: `src/auth/authConfig.js`

## CI/CD
- GitHub Actions: `.github/workflows/azure-static-web-apps-*.yml`
- Deploys to Azure Static Web Apps on push to `main`
- Build output: `dist/`
- Env vars injected via GitHub secrets during deploy

## Notes
- No test framework configured
- Lint: typescript-eslint + eslint-plugin-react-refresh
- No typecheck script (typescript-eslint handles this)
- Vite loads env vars via `loadEnv()` in vite.config.ts