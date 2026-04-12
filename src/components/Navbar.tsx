import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

interface NavbarProps {
  onProfileClick: () => void;
}

export default function Navbar({ onProfileClick }: NavbarProps) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = isAuthenticated
    ? (accounts[0].name ?? accounts[0].username ?? 'U')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  function handleSignIn() {
    import('../auth/authConfig').then(({ loginRequest }) => {
      instance.loginRedirect(loginRequest).catch(console.error);
    });
  }

  function handleSignUp() {
    import('../auth/authConfig').then(({ loginRequest }) => {
      instance.loginRedirect({ ...loginRequest, prompt: 'create' }).catch(console.error);
    });
  }

  return (
    <>
      <nav className="navbar">
        <a className="navbar-logo" href="#">
          <img src="/logo.jpg" alt="Gonetta" />
        </a>

        {isAuthenticated && (
          <div className="navbar-center">
            <button className="navbar-link">🏠 Home</button>
            <button className="navbar-link">🗓️ Partite</button>
            <button className="navbar-link">🏆 Tornei</button>
            <button className="navbar-link">📊 Classifiche</button>
            <button className="navbar-link">🎾 Campi</button>
          </div>
        )}

        <div className="navbar-right">
          {isAuthenticated ? (
            <button className="avatar-btn" onClick={onProfileClick} title="Profilo">
              {initials}
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleSignIn}>Accedi</button>
              <button className="btn-primary" onClick={handleSignUp}>Registrati</button>
            </>
          )}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <button className="navbar-link" onClick={() => setMenuOpen(false)}>🏠 Home</button>
            <button className="navbar-link" onClick={() => setMenuOpen(false)}>🗓️ Partite</button>
            <button className="navbar-link" onClick={() => setMenuOpen(false)}>🏆 Tornei</button>
            <button className="navbar-link" onClick={() => setMenuOpen(false)}>📊 Classifiche</button>
            <button className="navbar-link" onClick={() => setMenuOpen(false)}>🎾 Campi</button>
            <button className="btn-primary" onClick={() => { onProfileClick(); setMenuOpen(false); }}>
              👤 Il mio profilo
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={() => { handleSignIn(); setMenuOpen(false); }}>Accedi</button>
            <button className="btn-primary" onClick={() => { handleSignUp(); setMenuOpen(false); }}>Registrati</button>
          </>
        )}
      </div>
    </>
  );
}
