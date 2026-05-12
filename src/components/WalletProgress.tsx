import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

type TokenProvider = () => Promise<string>;

type PlayerWalletAward = {
  id?: number;
  player_id: number;
  points: number;
  cost: number;
  charge_datetime: string;
  award_description?: string;
};

type WalletProgressProps = {
  getAccessToken: TokenProvider;
  onBack: () => void;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const awardType = 'wallet';

export default function WalletProgress({ getAccessToken, onBack }: WalletProgressProps) {
  const { account } = useAuth();
  const [playerAwards, setPlayerAwards] = useState<PlayerWalletAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalValue = useMemo(
    () => playerAwards.reduce((sum, item) => sum + Number(item.points ?? 0), 0),
    [playerAwards]
  );

  async function authHeaders() {
    const token = await getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  useEffect(() => {
    const load = async () => {
      if (!account) return;
      setLoading(true);
      setError('');
      try {
        const headers = await authHeaders();
        const awardsListRes = await fetch(`${API_BASE}/playerawards/${awardType}/my/awards`, { headers });
        if (!awardsListRes.ok) throw new Error('Errore caricamento valori borsellino');
        setPlayerAwards(await awardsListRes.json());
      } catch (e: any) {
        setError(e.message ?? 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [account]);

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Il tuo Borsellino</h2>
        <p>Valori accumulati nel tempo.</p>
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-alert">Caricamento in corso...</div>}

      <section className="fidelity-hero">
        <div className="fidelity-hero-icon">👛</div>
        <div className="fidelity-hero-info">
          <div className="fidelity-hero-points">{totalValue}</div>
          <div className="fidelity-hero-label">valori totali</div>
        </div>
      </section>

      <section className="fidelity-history-section">
        <h3>Valori ricevuti</h3>
        {!loading && !error && playerAwards.length === 0 ? (
          <p className="fidelity-empty">Nessun valore accumulato ancora.</p>
        ) : (
          <div className="fidelity-history-list">
            {[...playerAwards]
              .sort((a, b) => new Date(b.charge_datetime).getTime() - new Date(a.charge_datetime).getTime())
              .map((award) => (
                <div key={award.id} className="fidelity-history-item">
                  <div className="fidelity-history-date">
                    {new Date(award.charge_datetime).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="fidelity-history-points">+{award.points}</div>
                  <div className="fidelity-history-description">Valore borsellino</div>
                </div>
              ))}
          </div>
        )}
      </section>

      <button className="btn-secondary" onClick={onBack} style={{ marginTop: 24 }}>
        ← Torna alla dashboard
      </button>
    </div>
  );
}
