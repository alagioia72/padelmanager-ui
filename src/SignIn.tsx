import { useMsal } from '@azure/msal-react';
import { loginRequest } from './auth/authConfig';

interface SignInProps {
  onSwitchToSignUp: () => void;
}

export default function SignIn({ onSwitchToSignUp }: SignInProps) {
  const { instance } = useMsal();

  function handleSignIn() {
    instance.loginRedirect(loginRequest).catch(console.error);
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-logo-wrap">
        <img src="/logo.jpg" alt="Gonetta" />
      </div>

      <h2>Accedi al tuo account</h2>
      <p className="subtitle">
        Gestisci partite, tornei e prenotazioni con il tuo account Microsoft.
      </p>

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" onClick={handleSignIn}>
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Accedi con Microsoft
        </button>
      </div>

      <p className="auth-note">
        Non hai un account?{' '}
        <button className="inline-link" onClick={onSwitchToSignUp}>Registrati gratis</button>
      </p>
    </div>
  );
}
