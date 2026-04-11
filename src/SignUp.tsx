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
      <h2>Crea il tuo account</h2>
      <p className="subtitle">
        Unisciti alla community di PadelManager e inizia a gestire il tuo gioco.
      </p>

      <div className="auth-toggle">
        <button className="auth-toggle-btn" onClick={onSwitchToSignIn}>Accedi</button>
        <button className="auth-toggle-btn active">Registrati</button>
      </div>

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" onClick={handleSignUp}>
          🚀 Registrati con Microsoft
        </button>
        <div className="auth-divider">oppure</div>
        <button className="auth-btn auth-btn-secondary" onClick={onSwitchToSignIn}>
          Ho già un account
        </button>
      </div>

      <p className="auth-note">
        Registrandoti accetti i{' '}
        <a href="#">Termini di Servizio</a> e la{' '}
        <a href="#">Privacy Policy</a>.
      </p>
    </div>
  );
}
