import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

type TokenProvider = () => Promise<string>;

type Player = {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  entra_id: string;
};

type FidelityAward = {
  id: number;
  description: string;
  points: number;
};

type AdminTab = 'players' | 'awards';

type AdminPanelProps = {
  getAccessToken: TokenProvider;
};

export default function AdminPanel({ getAccessToken }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [awards, setAwards] = useState<FidelityAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerActionOpenId, setPlayerActionOpenId] = useState<number | null>(null);
  const [pointsModalPlayer, setPointsModalPlayer] = useState<Player | null>(null);
  const [pointsModalValue, setPointsModalValue] = useState('');
  const [awardForm, setAwardForm] = useState({ id: '', description: '', points: '' });
  const [awardMode, setAwardMode] = useState<'create' | 'edit'>('create');

  const selectedPlayer = useMemo(
    () => players.find((player) => String(player.id) === selectedPlayerId),
    [players, selectedPlayerId]
  );

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase();
    if (!query) return players;
    return players.filter((player) => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      return (
        fullName.includes(query) ||
        player.gender.toLowerCase().includes(query) ||
        player.entra_id.toLowerCase().includes(query) ||
        String(player.id).includes(query)
      );
    });
  }, [players, playerSearch]);

  async function authHeaders() {
    const token = await getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const headers = await authHeaders();
      const [playersRes, awardsRes] = await Promise.all([
        fetch(`${API_BASE}/players`, { headers }),
        fetch(`${API_BASE}/fidelityawards`, { headers }),
      ]);
      if (!playersRes.ok) throw new Error('Errore caricamento players');
      if (!awardsRes.ok) throw new Error('Errore caricamento fidelity awards');
      setPlayers(await playersRes.json());
      setAwards(await awardsRes.json());
    } catch (e: any) {
      setError(e.message ?? 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddPoints(playerId?: number, pointsValue?: string) {
    const targetPlayerId = playerId ? String(playerId) : selectedPlayerId;
    const targetPoints = pointsValue ?? pointsModalValue;
    if (!targetPlayerId || !targetPoints) return;
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/players/${targetPlayerId}/points`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ points: Number(targetPoints) }),
      });
      if (!res.ok) throw new Error('Impossibile assegnare i punti');
      setPointsModalPlayer(null);
      setPointsModalValue('');
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore assegnazione punti');
    }
  }

  function resetAwardForm() {
    setAwardForm({ id: '', description: '', points: '' });
    setAwardMode('create');
  }

  async function handleSaveAward() {
    if (!awardForm.description || !awardForm.points) return;
    setError('');
    const payload = {
      description: awardForm.description,
      points: Number(awardForm.points),
    };
    try {
      const headers = await authHeaders();
      const res = await fetch(
        awardMode === 'create' ? `${API_BASE}/fidelityawards` : `${API_BASE}/fidelityawards/${awardForm.id}`,
        {
          method: awardMode === 'create' ? 'POST' : 'PUT',
          headers,
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Impossibile salvare il premio');
      resetAwardForm();
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore salvataggio premio');
    }
  }

  async function handleDeleteAward(id: number) {
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/fidelityawards/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Impossibile eliminare il premio');
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore eliminazione premio');
    }
  }

  function handleEditAward(award: FidelityAward) {
    setAwardMode('edit');
    setTab('awards');
    setAwardForm({ id: String(award.id), description: award.description, points: String(award.points) });
  }

  function openPointsModal(player: Player) {
    setPointsModalPlayer(player);
    setPointsModalValue('');
  }

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Area Admin</h2>
        <p>Gestione utenti, punti fedeltà e premi.</p>
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-alert">Caricamento in corso...</div>}

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'players' ? 'active' : ''}`} onClick={() => setTab('players')}>
          Elenco players
        </button>
        <button className={`admin-tab ${tab === 'awards' ? 'active' : ''}`} onClick={() => setTab('awards')}>
          Premi fedeltà
        </button>
      </div>

      {tab === 'players' ? (
        <section className="admin-card">
          <div className="admin-section-header">
            <h3>Elenco players</h3>
            <span className="admin-badge">{filteredPlayers.length} / {players.length}</span>
          </div>

          <div className="admin-form admin-form-inline">
            <input
              placeholder="Cerca per nome, ID, genere o entra ID"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
            />
          </div>

          <div className="admin-list admin-players-list">
            {filteredPlayers.map((player) => {
              const isOpen = playerActionOpenId === player.id;
              return (
                <div className="admin-list-item admin-player-row" key={player.id}>
                  <div className="admin-player-main">
                    <strong>{player.first_name} {player.last_name}</strong>
                    <span>#{player.id} · Genere: {player.gender}</span>
                    <p>Entra ID: {player.entra_id}</p>
                  </div>

                  <div className="admin-player-actions">
                    <button
                      className="admin-points-btn"
                      onClick={() => openPointsModal(player)}
                    >
                      Assegna punti
                    </button>
                    {isOpen && (
                      <div className="admin-player-menu">
                        <button
                          className="admin-player-menu-item"
                          onClick={() => {
                            openPointsModal(player);
                            setPlayerActionOpenId(null);
                          }}
                        >
                          Assegna punti
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPlayer && (
            <div className="admin-highlight">
              Player selezionato: {selectedPlayer.first_name} {selectedPlayer.last_name}
            </div>
          )}
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-section-header">
            <h3>Premi fedeltà</h3>
            <span className="admin-badge">CRUD</span>
          </div>

          <div className="admin-form">
            <input
              placeholder="Descrizione"
              value={awardForm.description}
              onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Punti da raggiungere"
              value={awardForm.points}
              onChange={(e) => setAwardForm({ ...awardForm, points: e.target.value })}
            />
            <div className="admin-form-actions">
              <button className="btn-primary" onClick={handleSaveAward}>
                {awardMode === 'create' ? 'Crea premio' : 'Salva modifiche'}
              </button>
              {awardMode === 'edit' && (
                <button className="btn-secondary" onClick={resetAwardForm}>
                  Annulla
                </button>
              )}
            </div>
          </div>

          <div className="admin-list">
            {awards.map((award) => (
              <div className="admin-list-item" key={award.id}>
                <strong>#{award.id} - {award.description}</strong>
                <span>Punti: {award.points}</span>
                <div className="admin-item-actions">
                  <button className="btn-secondary" onClick={() => handleEditAward(award)}>Modifica</button>
                  <button className="btn-outline-danger" onClick={() => handleDeleteAward(award.id)}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pointsModalPlayer && (
        <div className="overlay" onClick={() => setPointsModalPlayer(null)}>
          <div className="profile-modal admin-points-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <button className="profile-modal-close" onClick={() => setPointsModalPlayer(null)}>✕</button>
              <div className="profile-modal-name">{pointsModalPlayer.first_name} {pointsModalPlayer.last_name}</div>
              <div className="profile-modal-email">Assegnazione punti fedeltà</div>
            </div>
            <div className="profile-modal-body">
              <div className="profile-info-row">
                <span className="profile-info-icon">🎾</span>
                <div>
                  <div className="profile-info-label">Player selezionato</div>
                  <div className="profile-info-value">{pointsModalPlayer.first_name} {pointsModalPlayer.last_name}</div>
                </div>
              </div>
              <div className="admin-form admin-form-inline">
                <input
                  type="number"
                  min="1"
                  placeholder="Punti da assegnare"
                  value={pointsModalValue}
                  onChange={(e) => setPointsModalValue(e.target.value)}
                />
              </div>
            </div>
            <div className="profile-modal-footer">
              <button className="btn-primary" onClick={() => handleAddPoints(pointsModalPlayer.id, pointsModalValue)}>
                Conferma assegnazione
              </button>
              <button className="btn-secondary" onClick={() => setPointsModalPlayer(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
