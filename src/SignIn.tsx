import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './auth/authConfig';

export default function SignIn() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();


  function handleSignIn() {
      console.log("Sign IN button clicked");

      instance.loginRedirect(loginRequest).catch((error) => console.log(error));
  }


  return (
    <button onClick={handleSignIn} className="bg-blue-500 text-white px-4 py-2 rounded">
        SignIn
    </button>
  )
}