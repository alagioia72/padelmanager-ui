import { useMsal } from '@azure/msal-react';
import { loginRequest } from './auth/authConfig';

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export default function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const { instance } = useMsal();

  function handleSignUp() {
    instance
      .loginRedirect({ ...loginRequest, prompt: 'create' })
      .catch(console.error);
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-logo-wrap">
        <img src="/logo.jpg" alt="Gonetta" />
      </div>

      <h2>Crea il tuo account</h2>
      <p className="subtitle">
        Unisciti alla community di Gonetta e inizia a gestire il tuo gioco di padel.
      </p>

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" onClick={handleSignUp}>
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Registrati con Microsoft
        </button>
      </div>

      <p className="auth-note">
        Hai già un account?{' '}
        <button className="inline-link" onClick={onSwitchToSignIn}>Accedi</button>
      </p>
    </div>
  );
}
