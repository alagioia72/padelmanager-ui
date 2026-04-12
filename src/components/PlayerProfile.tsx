import { useMsal } from '@azure/msal-react';

interface PlayerProfileProps {
  onClose: () => void;
}

export default function PlayerProfile({ onClose }: PlayerProfileProps) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const name = account?.name ?? account?.username ?? 'Giocatore';
  const email = account?.username ?? '';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function handleSignOut() {
    instance.logoutRedirect().catch(console.error);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <button className="profile-modal-close" onClick={onClose}>✕</button>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-modal-name">{name}</div>
          <div className="profile-modal-email">{email}</div>
        </div>

        <div className="profile-modal-body">
          <div className="profile-info-row">
            <span className="profile-info-icon">📧</span>
            <div>
              <div className="profile-info-label">Email</div>
              <div className="profile-info-value">{email || '—'}</div>
            </div>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-icon">🆔</span>
            <div>
              <div className="profile-info-label">ID Account</div>
              <div className="profile-info-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {account?.localAccountId?.slice(0, 24)}…
              </div>
            </div>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-icon">🎾</span>
            <div>
              <div className="profile-info-label">Livello</div>
              <div className="profile-info-value">— (coming soon)</div>
            </div>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-icon">🏆</span>
            <div>
              <div className="profile-info-label">Tornei disputati</div>
              <div className="profile-info-value">— (coming soon)</div>
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button className="btn-outline-danger" onClick={handleSignOut}>
            🚪 Esci dall'account
          </button>
        </div>
      </div>
    </div>
  );
}
