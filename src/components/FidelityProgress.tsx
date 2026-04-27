import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

type TokenProvider = () => Promise<string>;

type FidelityAward = {
  id: number;
  description: string;
  points: number;
};

type PlayerFidelityAward = {
  id?: number;
  player_id: number;
  points: number;
  cost: number;
  charge_datetime: string;
  award_description?: string;
};

type FidelityProgressProps = {
  getAccessToken: TokenProvider;
  onBack: () => void;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default function FidelityProgress({ getAccessToken, onBack }: FidelityProgressProps) {
  const { account } = useAuth();
  const [awards, setAwards] = useState<FidelityAward[]>([]);
  const [playerAwards, setPlayerAwards] = useState<PlayerFidelityAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'progress' | 'history'>('progress');

  const totalPoints = useMemo(
    () => playerAwards.reduce((sum, item) => sum + Number(item.points ?? 0), 0),
    [playerAwards]
  );

  const sortedAwards = useMemo(
    () => [...awards].sort((a, b) => a.points - b.points),
    [awards]
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
        const awardsRes = await fetch(`${API_BASE}/fidelityawards`, { headers });
        if (!awardsRes.ok) throw new Error('Errore caricamento premi');
        const awardsData = await awardsRes.json();
        setAwards(awardsData);
        const awardsListRes = await fetch(`${API_BASE}/playerfidelityawards/my/awards`, { headers });
        if (!awardsListRes.ok) throw new Error('Errore caricamento punti');
        setPlayerAwards(await awardsListRes.json());
      } catch (e: any) {
        setError(e.message ?? 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [account]);

  const nextAward = useMemo(() => {
    return sortedAwards.find((a) => totalPoints < a.points);
  }, [awards, totalPoints]);

  const previousAwardPoints = useMemo(() => {
    if (!nextAward) return 0;
    const idx = sortedAwards.indexOf(nextAward);
    return idx > 0 ? sortedAwards[idx - 1].points : 0;
  }, [sortedAwards, nextAward]);

  const pointsToNext = useMemo(() => {
    if (!nextAward) return 0;
    return Math.max(0, nextAward.points - totalPoints);
  }, [nextAward, totalPoints]);

  const progressPercent = useMemo(() => {
    if (!nextAward) return 100;
    const range = nextAward.points - previousAwardPoints;
    const progress = totalPoints - previousAwardPoints;
    return Math.min(100, (progress / range) * 100);
  }, [nextAward, totalPoints, previousAwardPoints]);

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>I tuoi punti fedeltà</h2>
        <p>Segui il tuo percorso verso i premi.</p>
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-alert">Caricamento in corso...</div>}

      <div className="fidelity-tabs">
        <button
          className={`fidelity-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progresso
        </button>
        <button
          className={`fidelity-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Storico punti
        </button>
      </div>

      {activeTab === 'progress' && (
        <>
          <section className="fidelity-hero">
            <div className="fidelity-hero-icon">🎁</div>
            <div className="fidelity-hero-info">
              <div className="fidelity-hero-points">{totalPoints}</div>
              <div className="fidelity-hero-label">punti accumulati</div>
            </div>
          </section>

          {!loading && !error && (
            <>
              {nextAward ? (
                <section className="fidelity-progress-section">
                  <h3>Prossimo premio</h3>
                  <div className="fidelity-milestone-card">
                    <div className="fidelity-milestone-header">
                      <span className="fidelity-milestone-award">{nextAward.description}</span>
                      <span className="fidelity-milestone-target">{nextAward.points} punti</span>
                    </div>
                    <div className="fidelity-progress-bar">
                      <div className="fidelity-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="fidelity-progress-info">
                      <span>{progressPercent.toFixed(0)}%</span>
                      <span>{pointsToNext} punti mancanti</span>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="fidelity-progress-section">
                  <h3>Tutti i premi ritirati!</h3>
                  <div className="fidelity-all-done">
                    <span>🎉</span>
                    <p>Hai raggiunto tutti i premi disponibili. Contatta il club per nuove ricompense!</p>
                  </div>
                </section>
              )}

              <section className="fidelity-awards-section">
                <h3>I tuoi premi</h3>
                <div className="fidelity-timeline">
                  {sortedAwards.map((award) => {
                    const isAchieved = totalPoints >= award.points;
                    return (
                      <div key={award.id} className={`fidelity-timeline-item ${isAchieved ? 'achieved' : ''}`}>
                        <div className="fidelity-timeline-marker">
                          {isAchieved ? award.points : award.points}
                        </div>
                        <div className="fidelity-timeline-content">
                          <div className="fidelity-timeline-award">{award.description}</div>
                          <div className="fidelity-timeline-points">
                            {isAchieved ? (
                              <span className="fidelity-claim-msg">Complimenti! Passa a ritirare il tuo premio!</span>
                            ) : (
                              <span>{totalPoints} / {award.points} punti</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <section className="fidelity-history-section">
          <h3>Movimenti</h3>
          {playerAwards.length === 0 ? (
            <p className="fidelity-empty">Nessun punto accumulato ancora.</p>
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
                    <div className="fidelity-history-description">Punti fedeltà</div>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      <button className="btn-secondary" onClick={onBack} style={{ marginTop: 24 }}>
        ← Torna alla dashboard
      </button>
    </div>
  );
}