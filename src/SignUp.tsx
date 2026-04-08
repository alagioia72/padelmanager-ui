import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './auth//authConfig';

export default function SignUp() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  function handleSignUp() {
      console.log("Sign up button clicked");

      instance.loginRedirect({
                ...loginRequest,
                prompt: 'create',
            })
            .catch((error) => console.log(error));
  }


  return (
    <button onClick={handleSignUp} className="bg-blue-500 text-white px-4 py-2 rounded">
        SignUp
    </button>
  )
}