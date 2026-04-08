import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import './App.css'
import SignUp from './SignUp'
import SignIn from './SignIn';
import SignOut from './SignOut';

function App({ instance }) {
  return (
    <>
      <MsalProvider instance={instance}>
        <AuthenticatedTemplate>
          <p>Authnticated</p>
          <SignOut />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <SignUp />
          <SignIn />
          <p>NOT Authenticated</p>
        </UnauthenticatedTemplate>
      </MsalProvider>
    </>
  )
}

export default App
