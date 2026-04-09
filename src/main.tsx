import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication, EventType, type AuthenticationResult } from '@azure/msal-browser';
import './index.css'
import App from './App.tsx'
import { msalConfig } from './auth/authConfig';

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const msalInstance = new PublicClientApplication(msalConfig);
console.log("MSAL instance created:", msalConfig);

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        msalInstance.setActiveAccount(account);
    }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App instance={msalInstance}/>
  </StrictMode>,
)
