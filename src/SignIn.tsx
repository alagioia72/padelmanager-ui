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
      <h2>Bentornato!</h2>
      <p className="subtitle">
        Accedi al tuo account per gestire le tue partite, tornei e molto altro.
      </p>

      <div className="auth-toggle">
        <button className="auth-toggle-btn active">Accedi</button>
        <button className="auth-toggle-btn" onClick={onSwitchToSignUp}>Registrati</button>
      </div>

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" onClick={handleSignIn}>
          🔑 Accedi con Microsoft
        </button>
      </div>

      <p className="auth-note">
        Non hai ancora un account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}>
          Registrati gratis
        </a>
      </p>
    </div>
  );
}
