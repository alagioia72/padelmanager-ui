import { useEffect, useRef, useState } from 'react';
import { speechService } from './SpeechService';
import { parseCommand, findPlayerByName } from './CommandParser';
import type { ParsedCommand, SpeechResult } from './types';

type VoiceCommandButtonProps = {
  players: Array<{ id: number; first_name: string; last_name: string }>;
  onAddPoints: (playerId: number, points: number, cost: number) => Promise<void>;
  onShowPoints: (playerId: number) => void;
  onError: (message: string) => void;
};

type VoiceState = 'idle' | 'listening' | 'processing';
type VoicePhase = 'command' | 'ask_cost' | 'confirm';

type PendingCommand = {
  playerId: number;
  playerName: string;
  points: number;
  cost: number | null;
};

function parseCost(text: string): number | null {
  const normalized = text.toLowerCase();
  const keywords = ['euro', 'eur', '€'];
  
  for (const keyword of keywords) {
    const regex = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${keyword}`, 'i');
    const match = normalized.match(regex);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  
  const numbers = normalized.match(/\d+(?:[.,]\d+)?/g);
  if (numbers) {
    const last = parseFloat(numbers[numbers.length - 1].replace(',', '.'));
    if (last > 0) return last;
  }
  
  const wordToNumber: Record<string, number> = {
    'zero': 0, 'uno': 1, 'una': 1, 'un': 1,
    'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5,
    'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9,
    'dieci': 10, 'undici': 11, 'dodici': 12, 'tredici': 13,
    'quattordici': 14, 'quindici': 15, 'sedici': 16,
    'diciassette': 17, 'diciotto': 18, 'diciannove': 19,
    'venti': 20, 'trenta': 30, 'quaranta': 40, 'cinquanta': 50,
  };
  
  const words = normalized.split(/\s+/);
  for (const word of words) {
    const num = wordToNumber[word];
    if (num !== undefined && num > 0) return num;
  }
  
  return null;
}

export default function VoiceCommandButton({
  players,
  onAddPoints,
  onShowPoints,
  onError,
}: VoiceCommandButtonProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [phase, setPhase] = useState<VoicePhase>('command');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [pendingCommand, setPendingCommand] = useState<PendingCommand | null>(null);
  
  const playersRef = useRef(players);
  playersRef.current = players;
  const onAddPointsRef = useRef(onAddPoints);
  onAddPointsRef.current = onAddPoints;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onShowPointsRef = useRef(onShowPoints);
  onShowPointsRef.current = onShowPoints;

  const pendingCommandRef = useRef(pendingCommand);
  pendingCommandRef.current = pendingCommand;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const handleResultRef = useRef<(result: SpeechResult) => void>(() => {});
  const handleErrorRef = useRef<(error: { message: string; code: string }) => void>(() => {});
  const handleEndRef = useRef<() => void>(() => {});

  useEffect(() => {
    setIsSupported(speechService.isSupported);
  }, []);

  const handleResult = (result: SpeechResult) => {
    setTranscript(result.transcript);

    if (result.isFinal) {
      setState('processing');
      const text = result.transcript.toLowerCase();
      const currentPhase = phaseRef.current;
      const currentPending = pendingCommandRef.current;

      if (currentPhase === 'ask_cost') {
        const cost = parseCost(result.transcript);
        if (cost === null || cost < 0) {
          speakAndListen('Non ho capito il costo. Ripetilo, ad esempio "venti euro".');
          return;
        }

        const newPending = { ...currentPending!, cost };
        setPendingCommand(newPending);
        pendingCommandRef.current = newPending;
        setPhase('confirm');
        phaseRef.current = 'confirm';
        
        speakAndListen(`Confermi ${newPending.points} punti per ${newPending.playerName} al costo di ${cost} euro?`);
      } else if (currentPhase === 'confirm') {
        if (text.includes('si') || text.includes('sì') || text.includes('conferma') || text.includes('ok') || text.includes('va bene')) {
          doConfirm();
        } else if (text.includes('no') || text.includes('annulla')) {
          speechService.speak('Cancellato', 'it-IT', () => {
            setPendingCommand(null);
            setPhase('command');
            phaseRef.current = 'command';
            setState('idle');
            setTranscript('');
          });
        } else {
          speakAndListen('Non ho capito. Dì "sì" per confermare o "no" per cancellare.');
        }
      } else {
        doProcessCommand(result.transcript);
      }
    }
  };

  const handleError = (error: { message: string; code: string }) => {
    setState('idle');
    setTranscript('');
    onErrorRef.current(error.message);
  };

  const handleEnd = () => {
    const currentState = state;
    const currentPhase = phaseRef.current;
    if (currentState === 'listening' && currentPhase !== 'command') {
      setState('idle');
    }
  };

  const doConfirm = async () => {
    const pending = pendingCommandRef.current;
    if (!pending || pending.cost === null) return;

    try {
      await onAddPointsRef.current(pending.playerId, pending.points, pending.cost);
      speechService.speak(`Fatto! Ho assegnato ${pending.points} punti a ${pending.playerName}.`);
    } catch {
      speechService.speak(`Errore nel salvare i punti per ${pending.playerName}.`);
      onErrorRef.current(`Errore nel salvare i punti per ${pending.playerName}`);
    }

    setPendingCommand(null);
    setPhase('command');
    phaseRef.current = 'command';
    setState('idle');
    setTranscript('');
  };

  const doProcessCommand = (text: string) => {
    const parsed: ParsedCommand = parseCommand(text);

    if (parsed.intent === 'cancel') {
      speechService.speak('Cancellato', 'it-IT', () => {
        setPendingCommand(null);
        setPhase('command');
        phaseRef.current = 'command';
        setState('idle');
        setTranscript('');
      });
      return;
    }

    if (parsed.intent === 'unknown') {
      speakAndListen('Comando non riconosciuto. Riprova.');
      onErrorRef.current('Comando non riconosciuto: "' + text + '"');
      return;
    }

    if (!parsed.playerName) {
      speakAndListen('Non ho capito il nome del giocatore.');
      onErrorRef.current('Nome del giocatore non trovato nel comando.');
      return;
    }

    const player = findPlayerByName(parsed.playerName, playersRef.current);

    if (!player) {
      speakAndListen(`Non trovo il giocatore ${parsed.playerName}. Riprova.`);
      onErrorRef.current(`Giocatore "${parsed.playerName}" non trovato.`);
      return;
    }

    const fullName = `${player.first_name} ${player.last_name}`;

    if (parsed.intent === 'add_points') {
      const points = parsed.points || 10;
      const newPending = { playerId: player.id, playerName: fullName, points, cost: null };
      setPendingCommand(newPending);
      pendingCommandRef.current = newPending;
      setPhase('ask_cost');
      phaseRef.current = 'ask_cost';
      speakAndListen(`Aggiungo ${points} punti a ${fullName}. Quanto ha speso?`);
    } else if (parsed.intent === 'show_points') {
      onShowPointsRef.current(player.id);
      speechService.speak(`Mostro i punti di ${fullName}.`, 'it-IT', () => {
        setState('idle');
        setTranscript('');
      });
    }
  };

  const speakAndListen = (text: string) => {
    setState('processing');
    speechService.speak(text, 'it-IT', () => {
      setState('listening');
      speechService.startListening({
        onResult: handleResultRef.current,
        onError: handleErrorRef.current,
        onEnd: handleEndRef.current,
      });
    });
  };

  const toggleListening = () => {
    if (state === 'listening') {
      speechService.stopListening();
      setState('idle');
    } else {
      setTranscript('');
      setPhase('command');
      phaseRef.current = 'command';
      setState('listening');
      speechService.startListening({
        onResult: handleResultRef.current,
        onError: handleErrorRef.current,
        onEnd: handleEndRef.current,
      });
      speechService.speak('Ti ascolto');
    }
  };

  useEffect(() => {
    handleResultRef.current = handleResult;
    handleErrorRef.current = handleError;
    handleEndRef.current = handleEnd;
  });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-command-container">
      <button
        className={`voice-btn ${state}`}
        onClick={toggleListening}
        title={
          state === 'listening'
            ? 'Clicca per fermare'
            : 'Comando vocale - Clicca e parla'
        }
      >
        <span className="voice-icon">{state === 'listening' ? '🔴' : '🎤'}</span>
        <span className="voice-label">
          {state === 'idle' && 'Vocale'}
          {state === 'listening' && (phase === 'ask_cost' ? 'Quanto ha speso?' : phase === 'confirm' ? 'Confermi?' : 'Ascolto...')}
          {state === 'processing' && 'Elaboro...'}
        </span>
        {state === 'listening' && <span className="voice-wave">〰️</span>}
      </button>

      {transcript && state !== 'idle' && (
        <div className="voice-transcript">
          <em>"{transcript}"</em>
        </div>
      )}
    </div>
  );
}