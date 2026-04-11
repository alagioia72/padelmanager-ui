# PadelManager UI

## Overview
A React-based frontend for the PadelManager platform. Implements user authentication via Azure Active Directory (Microsoft Entra ID) using MSAL (Microsoft Authentication Library).

## Tech Stack
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 8
- **Auth:** Azure MSAL (`@azure/msal-browser`, `@azure/msal-react`)
- **Package Manager:** npm

## Project Structure
```
src/
  auth/authConfig.js   - Azure AD MSAL configuration
  App.tsx              - Main app component with auth routing
  main.tsx             - Entry point, MSAL initialization
  SignIn.tsx           - Sign-in page
  SignUp.tsx           - Sign-up page
  SignOut.tsx          - Sign-out page
```

## Development
- Run: `npm run dev` (starts on port 5000)
- Build (prod): `npm run build:prod`
- Build (azure): `npm run build:azure`

## Environment Variables
The following environment variables are required:
- `VITE_AUTH_CLIENT_ID` - Azure AD application client ID
- `VITE_AUTH_TENANT_ID` - Azure AD tenant ID
- `VITE_AUTH_REDIRECT_URI` - OAuth redirect URI
- `VITE_AUTHORITY_URI` - Azure AD authority URI
- `VITE_API_BASE_URL` - Backend API base URL

## Deployment
- Deployed as a static site using `dist/` output directory
- Build command: `npm run build:prod`

## Replit Configuration
- Dev server runs on `0.0.0.0:5000` with `allowedHosts: true` for proxy compatibility
- Workflow: "Start application" runs `npm run dev`
