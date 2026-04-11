import { useState } from 'react';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import './App.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PlayerProfile from './components/PlayerProfile';

function AppContent() {
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />

      <div className="page-content">
        <AuthenticatedTemplate>
          <Dashboard />
          {showProfile && <PlayerProfile onClose={() => setShowProfile(false)} />}
        </AuthenticatedTemplate>

        <UnauthenticatedTemplate>
          <div className="auth-page">
            <div className="auth-left">
              <div className="auth-left-tag">🏓 Padel Management</div>
              <h1>Il tuo padel,<br />senza limiti.</h1>
              <p>
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
            </div>

            <div className="auth-right">
              {authMode === 'signin' ? (
                <SignIn onSwitchToSignUp={() => setAuthMode('signup')} />
              ) : (
                <SignUp onSwitchToSignIn={() => setAuthMode('signin')} />
              )}
            </div>
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
