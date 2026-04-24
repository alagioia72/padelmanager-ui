# AGENTS.md - PadelManager UI

## Commands
- `npm run dev` - Start dev server (port 5000)
- `npm run build` - Production build (outputs to `dist/`)
- `npm run lint` - Run ESLint

## Environment Required
Create `.env` with:
- `VITE_AUTH_CLIENT_ID`
- `VITE_AUTH_TENANT_ID`
- `VITE_AUTH_REDIRECT_URI`
- `VITE_AUTHORITY_URI`
- `VITE_API_BASE_URL`

## Architecture
- Single-page React 19 + TypeScript app with Vite
- Auth: Azure AD via MSAL (`@azure/msal-browser`, `@azure/msal-react`)
- Entrypoint: `src/main.tsx` → `src/App.tsx`
- Auth config: `src/auth/authConfig.js`

## CI/CD
- GitHub Actions workflow: `.github/workflows/azure-static-web-apps-*.yml`
- Deploys to Azure Static Web Apps on push to `main`
- Build output: `dist/` directory

## Notes
- No test framework configured (see `package.json` scripts)
- Lint runs with `typescript-eslint` + `eslint-plugin-react-refresh`