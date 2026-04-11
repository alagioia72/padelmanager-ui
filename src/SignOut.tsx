import { useMsal } from '@azure/msal-react';

export default function SignOut() {
  const { instance } = useMsal();

  function handleSignOut() {
    instance.logoutRedirect().catch(console.error);
  }

  return (
    <button className="btn-outline-danger" onClick={handleSignOut}>
      🚪 Esci dall'account
    </button>
  );
}
