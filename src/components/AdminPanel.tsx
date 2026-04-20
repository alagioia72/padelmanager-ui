import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

type Player = {
  id: string;
  name?: string;
  email?: string;
  points?: number;
};

type Award = {
  id?: string;
  name?: string;
  minPoints?: number;
  description?: string;
};

export default function AdminPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [awardForm, setAwardForm] = useState({ name: '', minPoints: '', description: '' });

  const selected = useMemo(() => players.find((p) => p.id === selectedPlayer), [players, selectedPlayer]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [playersRes, awardsRes] = await Promise.all([
        fetch(`${API_BASE}/players`),
        fetch(`${API_BASE}/fidelityawards`),
      ]);
      if (!playersRes.ok) throw new Error('Errore caricamento players');
      if (!awardsRes.ok) throw new Error('Errore caricamento premi');
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
    if (!selectedPlayer || pointsToAdd <= 0) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/players/${selectedPlayer}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: pointsToAdd }),
      });
      if (!res.ok) throw new Error('Impossibile assegnare i punti');
      setPointsToAdd(0);
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore assegnazione punti');
    }
  }

  async function handleCreateAward() {
    if (!awardForm.name || !awardForm.minPoints) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/fidelityawards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: awardForm.name,
          minPoints: Number(awardForm.minPoints),
          description: awardForm.description,
        }),
      });
      if (!res.ok) throw new Error('Impossibile salvare il premio');
      setAwardForm({ name: '', minPoints: '', description: '' });
      await loadData();
    } catch (e: any) {
      setError(e.message ?? 'Errore creazione premio');
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Area Admin</h2>
        <p>Gestione premi fedeltà e assegnazione punti ai giocatori.</p>
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-alert">Caricamento in corso...</div>}

      <div className="admin-grid">
        <section className="admin-card">
          <h3>Premi fidelity</h3>
          <div className="admin-form">
            <input placeholder="Nome premio" value={awardForm.name} onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })} />
            <input placeholder="Scaglione punti" type="number" value={awardForm.minPoints} onChange={(e) => setAwardForm({ ...awardForm, minPoints: e.target.value })} />
            <textarea placeholder="Descrizione" value={awardForm.description} onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })} />
            <button className="btn-primary" onClick={handleCreateAward}>Salva premio</button>
          </div>
          <div className="admin-list">
            {awards.map((award, i) => (
              <div className="admin-list-item" key={award.id ?? i}>
                <strong>{award.name}</strong>
                <span>{award.minPoints} punti</span>
                <p>{award.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h3>Utenti</h3>
          <div className="admin-form">
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
              <option value="">Seleziona utente</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>{player.name ?? player.email ?? player.id}</option>
              ))}
            </select>
            <input type="number" min="1" placeholder="Punti da assegnare" value={pointsToAdd} onChange={(e) => setPointsToAdd(Number(e.target.value))} />
            <button className="btn-primary" onClick={handleAddPoints}>Assegna punti</button>
          </div>
          <div className="admin-list">
            {players.map((player) => (
              <div className="admin-list-item" key={player.id}>
                <strong>{player.name ?? 'Utente'}</strong>
                <span>{player.email}</span>
                <p>Punti attuali: {player.points ?? 0}</p>
              </div>
            ))}
          </div>
          {selected && <div className="admin-highlight">Selezionato: {selected.name ?? selected.email}</div>}
        </section>
      </div>
    </div>
  );
}
