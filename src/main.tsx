import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication, EventType, type AuthenticationResult } from '@azure/msal-browser';
import './index.css'
import App from './App.tsx'
import { msalConfig, msalInstance } from './auth/authConfig';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { MsalProvider } from '@azure/msal-react';

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
//const msalInstance = new PublicClientApplication(msalConfig);
async function bootstrap() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

  try {
    console.log("MSAL instance created:", msalConfig);

    await msalInstance.initialize();
    const response = await msalInstance.handleRedirectPromise();
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
    }
  } catch (err) {
    console.error("Errore handleRedirectPromise", err);
  }

  // Default to using the first account if no account is active on page load
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
  }

  const decodeToken = (token: string) => {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  }

  const createPlayerIfNotExists = async (accessToken: string) => {
    const claims = decodeToken(accessToken);;
    const data = {
      first_name: claims.given_name,
      last_name: claims.family_name,
      entra_id: claims.oid,
    };

    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });

    if (res.status !== 409 && !res.ok) { // 409 = Conflict (utente già esistente)
      const errorText = await res.text();
      console.log(`Error in user creation ${res.status}: ${errorText}`);
    }
  };

  // Listen for sign-in event and set active account
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      console.log(payload.accessToken);
      msalInstance.setActiveAccount(account);
      createPlayerIfNotExists(payload.accessToken).catch(console.error);
    }
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalProvider>
    </StrictMode>,
  );
}

bootstrap();
