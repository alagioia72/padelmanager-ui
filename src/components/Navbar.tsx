import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

interface NavbarProps {
  onProfileClick: () => void;
  isAdmin: boolean;
  activeSection: 'dashboard' | 'admin';
  onNavigate: (section: 'dashboard' | 'admin') => void;
}

export default function Navbar({ onProfileClick, isAdmin, activeSection, onNavigate }: NavbarProps) {
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
            <button className={`navbar-link ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Home</button>
            {isAdmin && <button className={`navbar-link ${activeSection === 'admin' ? 'active' : ''}`} onClick={() => onNavigate('admin')}>Admin</button>}
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
            <button className="navbar-link" onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}>Home</button>
            {isAdmin && <button className="navbar-link" onClick={() => { onNavigate('admin'); setMenuOpen(false); }}>Admin</button>}
            <button className="btn-primary" onClick={() => { onProfileClick(); setMenuOpen(false); }}>Il mio profilo</button>
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
