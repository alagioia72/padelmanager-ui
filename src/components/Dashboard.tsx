import { useMsal } from '@azure/msal-react';

export default function Dashboard() {
  const { accounts } = useMsal();
  const account = accounts[0];
  const firstName = account?.name?.split(' ')[0] ?? 'Giocatore';

  const cards = [
    {
      icon: '🗓️',
      color: 'rgba(45,114,184,0.12)',
      title: 'Le mie partite',
      desc: 'Visualizza e prenota le prossime partite di padel.',
      badge: 'soon',
    },
    {
      icon: '🏆',
      color: 'rgba(90,174,224,0.15)',
      title: 'Tornei',
      desc: 'Iscriviti ai tornei e segui le tue performance.',
      badge: 'soon',
    },
    {
      icon: '📊',
      color: 'rgba(26,74,138,0.12)',
      title: 'Classifiche',
      desc: 'Scopri il tuo ranking e quello degli altri giocatori.',
      badge: 'soon',
    },
    {
      icon: '🎾',
      color: 'rgba(45,114,184,0.1)',
      title: 'Prenotazione Campi',
      desc: 'Prenota un campo per allenarti con i tuoi amici.',
      badge: 'soon',
    },
    {
      icon: '👥',
      color: 'rgba(90,174,224,0.12)',
      title: 'Trova partner',
      desc: 'Trova giocatori del tuo livello per una partita.',
      badge: 'soon',
    },
    {
      icon: '📈',
      color: 'rgba(26,74,138,0.1)',
      title: 'Statistiche',
      desc: 'Analizza le tue statistiche e migliora il tuo gioco.',
      badge: 'soon',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Ciao, {firstName}! 👋</h2>
        <p>Bentornato su Gonetta. Cosa vuoi fare oggi?</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <div className="dashboard-card" key={i}>
            <div className="dashboard-card-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <span className="badge-soon">coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
