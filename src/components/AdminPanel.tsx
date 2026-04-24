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

type PlayerFidelityAward = {
  id?: number;
  player_id: number;
  points: number;
  cost: number;
  charge_datetime: string;
  award_description?: string;
  player_first_name?: string;
  player_last_name?: string;
};

type AdminTab = 'players' | 'awards' | 'fidelity';

type AdminPanelProps = {
  getAccessToken: TokenProvider;
};

export default function AdminPanel({ getAccessToken }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [awards, setAwards] = useState<FidelityAward[]>([]);
  const [fidelityAwards, setFidelityAwards] = useState<PlayerFidelityAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [pointsModalPlayer, setPointsModalPlayer] = useState<Player | null>(null);
  const [pointsModalAward, setPointsModalAward] = useState<PlayerFidelityAward | null>(null);
  //const [pointsModalPoints, setPointsModalPoints] = useState('');
  //const [pointsModalCost, setPointsModalCost] = useState('');
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

  const sortedFidelityAwards = useMemo(() => {
    return [...fidelityAwards].sort((a, b) => new Date(b.charge_datetime).getTime() - new Date(a.charge_datetime).getTime());
  }, [fidelityAwards]);

  const totalFidelityPoints = useMemo(() => {
    return fidelityAwards.reduce((sum, item) => sum + Number(item.points ?? 0), 0);
  }, [fidelityAwards]);

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

  async function loadFidelityAwards(playerId: string) {
    if (!playerId) {
      setFidelityAwards([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/playerfidelityawards/player/${playerId}`, { headers });
      if (!res.ok) throw new Error('Errore caricamento movimenti fidelity');
      setFidelityAwards(await res.json());
    } catch (e: any) {
      setError(e.message ?? 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddPoints(playerId?: number, pointsValue?: number, costValue?: number) {
    const targetPlayerId = playerId ? String(playerId) : selectedPlayerId;
    const targetPoints = pointsValue ?? pointsModalAward?.points;
    const targetCost = costValue ?? pointsModalAward?.cost;
    if (!targetPlayerId || !targetPoints || !targetCost) return;
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/playerfidelityawards`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          player_id: Number(targetPlayerId),
          points: Number(targetPoints),
          charge_datetime: new Date().toISOString(),
          cost: Number(targetCost),
        }),
      });
      if (!res.ok) throw new Error('Impossibile assegnare i punti');
      setPointsModalPlayer(null);
      setPointsModalAward(null);
      //setPointsModalPoints('');
      //setPointsModalCost('');
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore assegnazione punti');
    }
  }

  async function handleUpdateFidelityAward(playerId: number, pointsValue: number, costValue: number, itemId: number) {
    if (!pointsValue || !costValue) return;
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/playerfidelityawards/${itemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          player_id: playerId,
          points: Number(pointsValue),
          charge_datetime: new Date().toISOString(),
          cost: Number(costValue),
        }),
      });
      if (!res.ok) throw new Error('Impossibile modificare i punti');
      setPointsModalPlayer(null);
      setPointsModalAward(null);
      //setPointsModalPoints('');
      //setPointsModalCost('');
      if (selectedPlayerId) {
        await loadFidelityAwards(selectedPlayerId);
      }
    } catch (e: any) {
      setError(e.message ?? 'Errore modifica punti');
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
    setPointsModalAward(null);
    //setPointsModalPoints('');
    //setPointsModalCost('');
  }

  function openFidelityAwards(player: Player) {
    setSelectedPlayerId(String(player.id));
    setTab('fidelity');
    loadFidelityAwards(String(player.id));
  }

  async function handleDeleteFidelityAward(id: number) {
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/playerfidelityawards/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Impossibile eliminare il movimento');
      if (selectedPlayerId) {
        await loadFidelityAwards(selectedPlayerId);
      }
    } catch (e: any) {
      setError(e.message ?? 'Errore eliminazione movimento');
    }
  }

  function handleEditFidelityAward(item: PlayerFidelityAward) {
    const player = players.find((p) => p.id === item.player_id);
    if (player) {
      openPointsModal(player);
      setPointsModalAward(item);
      //setPointsModalPoints(String(item.points));
      //setPointsModalCost(String(item.cost));
      setSelectedPlayerId(String(item.player_id));
      setTab('fidelity');
    }
  }

  function confirmDeleteFidelityAward(id: number) {
    const confirmed = window.confirm('Vuoi davvero eliminare questo movimento punti?');
    if (!confirmed) return;
    handleDeleteFidelityAward(id);
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
        {selectedPlayer &&
        <button className={`admin-tab ${tab === 'fidelity' ? 'active' : ''}`} onClick={() => setTab('fidelity')}>
          Punti fedeltà {selectedPlayer.first_name} {selectedPlayer.last_name}
        </button>
        }
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
            {filteredPlayers.map((player) => (
              <div className="admin-list-item admin-player-row" key={player.id}>
                <div className="admin-player-main">
                  <strong>{player.first_name} {player.last_name}</strong>
                  <span>#{player.id} · Genere: {player.gender}</span>
                  <p>Entra ID: {player.entra_id}</p>
                </div>

                <div className="admin-player-actions">
                  <button className="admin-points-btn" onClick={() => openPointsModal(player)}>
                    Assegna punti
                  </button>
                  <button className="admin-fidelity-btn" onClick={() => openFidelityAwards(player)}>
                    Punti fedeltà
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedPlayer && (
            <div className="admin-highlight">
              Player selezionato: {selectedPlayer.first_name} {selectedPlayer.last_name}
            </div>
          )}
        </section>
      ) : tab === 'fidelity' ? (
        <section className="admin-card">
          <div className="admin-section-header">
            <h3>Elenco punti fedeltà · Totale {totalFidelityPoints}</h3>
            <span className="admin-badge">{sortedFidelityAwards.length}</span>
          </div>
          {selectedPlayer && (
            <div className="admin-highlight">
              Punti di: {selectedPlayer.first_name} {selectedPlayer.last_name}
            </div>
          )}

          <div className="admin-list">
            {sortedFidelityAwards.map((item) => (
              <div className="admin-list-item admin-fidelity-list-item" key={item.id ?? `${item.player_id}-${item.charge_datetime}`}>
                <div>
                  <span><strong>Punti: {item.points} · Costo: {item.cost}€</strong></span>
                  <p>Data: {new Date(item.charge_datetime).toLocaleString('it-IT')}</p>
                </div>
                <div className="admin-item-actions" style={{ marginTop: 0 }}>
                  <button className="btn-secondary" onClick={() => handleEditFidelityAward(item)}>Modifica</button>
                  {item.id && (
                    <button className="btn-outline-danger" onClick={() => confirmDeleteFidelityAward(item.id)}>
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                  placeholder="Punti"
                  value={pointsModalAward.points}
                  //onChange={(e) => setPointsModalPoints(e.target.value)}
                  onChange={(e) => setPointsModalAward({ ...pointsModalAward, points: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Costo"
                  value={pointsModalAward.cost}
                  //onChange={(e) => setPointsModalCost(e.target.value)}
                  onChange={(e) => setPointsModalAward({ ...pointsModalAward, cost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="profile-modal-footer">
              {tab === 'players' ? (
                //<button className="btn-primary" onClick={() => handleAddPoints(pointsModalPlayer.id, pointsModalPoints, pointsModalCost)}>
                <button className="btn-primary" onClick={() => handleAddPoints(pointsModalPlayer.id, pointsModalAward.points, pointsModalAward.cost)}>
                  Conferma assegnazione
                </button>
              ) : (
                <button className="btn-primary" onClick={() => handleUpdateFidelityAward(pointsModalPlayer.id, pointsModalAward.points, pointsModalAward.cost, Number(pointsModalAward.id))}>
                  Salva modifiche
                </button>
              )}
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
