import { useMsal } from '@azure/msal-react';

export default function Dashboard() {
  const { accounts } = useMsal();
  const account = accounts[0];
  const firstName = account?.name?.split(' ')[0] ?? 'Giocatore';

  const cards = [
    {
      icon: '🗓️',
      color: '#dbeafe',
      title: 'Le mie partite',
      desc: 'Visualizza e prenota le prossime partite di padel.',
      badge: 'coming soon',
    },
    {
      icon: '🏆',
      color: '#fef9c3',
      title: 'Tornei',
      desc: 'Iscriviti ai tornei e segui le tue performance.',
      badge: 'coming soon',
    },
    {
      icon: '📊',
      color: '#dcfce7',
      title: 'Classifiche',
      desc: 'Scopri il tuo ranking e quello degli altri giocatori.',
      badge: 'coming soon',
    },
    {
      icon: '🎾',
      color: '#fce7f3',
      title: 'Prenotazione Campi',
      desc: 'Prenota un campo per allenarti con i tuoi amici.',
      badge: 'coming soon',
    },
    {
      icon: '👥',
      color: '#ede9fe',
      title: 'Trova partner',
      desc: 'Trova giocatori del tuo livello per una partita.',
      badge: 'coming soon',
    },
    {
      icon: '📈',
      color: '#ffedd5',
      title: 'Statistiche',
      desc: 'Analizza le tue statistiche e migliora il tuo gioco.',
      badge: 'coming soon',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Ciao, {firstName}! 👋</h2>
        <p>Bentornato su PadelManager. Cosa vuoi fare oggi?</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <div className="dashboard-card" key={i}>
            <div className="dashboard-card-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <span className={card.badge === 'new' ? 'badge-new' : 'badge-soon'}>
              {card.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
