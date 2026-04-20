import { useMemo, useState } from 'react';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import './App.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PlayerProfile from './components/PlayerProfile';
import AdminPanel from './components/AdminPanel';

function getRoles(account: any) {
  const claims = account?.idTokenClaims ?? account?.idToken?.claims ?? {};
  const roles = claims.roles ?? claims.role ?? claims.extension_Roles ?? [];
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'string') return [roles];
  return [];
}

function AppContent() {
  const { accounts } = useMsal();
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'admin'>('dashboard');

  const account = accounts[0];
  const roles = useMemo(() => getRoles(account), [account]);
  const isAdmin = roles.includes('admin') || roles.includes('clubmanager');

  return (
    <>
      <Navbar
        onProfileClick={() => setShowProfile(true)}
        isAdmin={isAdmin}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <div className="page-content">
        <AuthenticatedTemplate>
          {activeSection === 'admin' && isAdmin ? <AdminPanel /> : <Dashboard />}
          {showProfile && <PlayerProfile onClose={() => setShowProfile(false)} />}
        </AuthenticatedTemplate>

        <UnauthenticatedTemplate>
          <div className="auth-page">
            <section className="auth-left">
              <div className="auth-left-tag">Gonetta Platform</div>
              <h1>Il tuo padel,<br />senza limiti.</h1>
              <p className="auth-left-sub">
                Prenota campi, iscriviti ai tornei, sfida altri giocatori e monitora
                le tue statistiche — tutto in un unico posto.
              </p>
              <div className="auth-features">
                <div className="auth-feature">
                  <div className="auth-feature-icon">🗓️</div>
                  <span>Prenotazione campi in tempo reale</span>
                </div>
                <div className="auth-feature">
                  <div className="auth-feature-icon">🏆</div>
                  <span>Tornei e classifiche aggiornate</span>
                </div>
                <div className="auth-feature">
                  <div className="auth-feature-icon">👥</div>
                  <span>Trova partner del tuo livello</span>
                </div>
                <div className="auth-feature">
                  <div className="auth-feature-icon">📊</div>
                  <span>Statistiche e analisi delle performance</span>
                </div>
              </div>
            </section>

            <aside className="auth-right">
              <div className="auth-operator-card">
                {authMode === 'signin' ? (
                  <SignIn onSwitchToSignUp={() => setAuthMode('signup')} />
                ) : (
                  <SignUp onSwitchToSignIn={() => setAuthMode('signin')} />
                )}
              </div>
            </aside>
          </div>
        </UnauthenticatedTemplate>
      </div>
    </>
  );
}

function App({ instance }: { instance: any }) {
  return (
    <MsalProvider instance={instance}>
      <AppContent />
    </MsalProvider>
  );
}

export default App;
