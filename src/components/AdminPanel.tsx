import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

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

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [awards, setAwards] = useState<FidelityAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [awardForm, setAwardForm] = useState({ id: '', description: '', points: '' });
  const [awardMode, setAwardMode] = useState<'create' | 'edit'>('create');

  const selectedPlayer = useMemo(
    () => players.find((player) => String(player.id) === selectedPlayerId),
    [players, selectedPlayerId]
  );

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [playersRes, awardsRes] = await Promise.all([
        fetch(`${API_BASE}/players`),
        fetch(`${API_BASE}/fidelityawards`),
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

  async function handleAddPoints() {
    if (!selectedPlayerId || !pointsToAdd) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/players/${selectedPlayerId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(pointsToAdd) }),
      });
      if (!res.ok) throw new Error('Impossibile assegnare i punti');
      setPointsToAdd('');
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
      const res = await fetch(
        awardMode === 'create' ? `${API_BASE}/fidelityawards` : `${API_BASE}/fidelityawards/${awardForm.id}`,
        {
          method: awardMode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/fidelityawards/${id}`, { method: 'DELETE' });
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
            <span className="admin-badge">{players.length} utenti</span>
          </div>

          <div className="admin-form admin-form-inline">
            <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}>
              <option value="">Seleziona un player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Punti da assegnare"
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAddPoints}>
              Assegna punti fedeltà
            </button>
          </div>

          <div className="admin-list">
            {players.map((player) => (
              <div className="admin-list-item" key={player.id}>
                <strong>{player.first_name} {player.last_name}</strong>
                <span>Genere: {player.gender}</span>
                <p>Entra ID: {player.entra_id}</p>
              </div>
            ))}
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
    </div>
  );
}
