import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './auth/authConfig';

export default function SignOut() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();


  function handleSignOut() {
      console.log("Sign OUT button clicked");

      instance.logoutRedirect().catch((error) => console.log(error));
  }


  return (
    <button onClick={handleSignOut} className="bg-blue-500 text-white px-4 py-2 rounded">
        SignOut
    </button>
  )
}