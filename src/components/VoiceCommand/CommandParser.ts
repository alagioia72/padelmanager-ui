import type { ParsedCommand } from './types';

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, uno: 1, una: 1, un: 1,
  due: 2, tre: 3, quattro: 4, cinque: 5,
  sei: 6, sette: 7, otto: 8, nove: 9,
  dieci: 10, undici: 11, dodici: 12, tredici: 13,
  quattordici: 14, quindici: 15, sedici: 16, diciassette: 17,
  diciotto: 18, diciannove: 19, venti: 20, ventuno: 21,
  ventidue: 22, ventitré: 23, ventiquattro: 24, venticinque: 25,
  ventisei: 26, ventisette: 27, ventotto: 28, ventinove: 29,
  trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60,
  settanta: 70, ottanta: 80, novanta: 90,
  cento: 100, duecento: 200, trecento: 300, quattrocento: 400,
  cinquecento: 500, seicento: 600, settecento: 700, ottocento: 800,
  novecento: 900, mille: 1000,
};

export function parseCommand(text: string): ParsedCommand {
  const normalized = text.toLowerCase().trim();

  if (isCancelCommand(normalized)) {
    return { intent: 'cancel', playerName: null, points: null, originalText: text };
  }

  const addPointsMatch = matchAddPoints(normalized);
  if (addPointsMatch) {
    return {
      intent: 'add_points',
      playerName: addPointsMatch.playerName,
      points: addPointsMatch.points,
      originalText: text,
    };
  }

  const showPointsMatch = matchShowPoints(normalized);
  if (showPointsMatch) {
    return {
      intent: 'show_points',
      playerName: showPointsMatch.playerName,
      points: null,
      originalText: text,
    };
  }

  return { intent: 'unknown', playerName: null, points: null, originalText: text };
}

function isCancelCommand(text: string): boolean {
  const cancelPatterns = [
    /^annulla$/i,
    /^chiudi$/i,
    /^stop$/i,
    /^basta$/i,
    /^no$/i,
    /^cancellami$/i,
  ];
  return cancelPatterns.some((pattern) => pattern.test(text));
}

function matchAddPoints(text: string): { playerName: string | null; points: number | null } | null {
  const patterns = [
    /aggiungi\s+(\d+)\s+punti\s+(?:a|ad)\s+(.+)/i,
    /aggiungi\s+([a-zàèéìòù]+(?:\s+[a-zàèéìòù]+)*)\s+punti\s+(?:a|ad)\s+(.+)/i,
    /assegna\s+(\d+)\s+punti?\s+(?:a|ad)\s+(.+)/i,
    /assegna\s+([a-zàèéìòù]+(?:\s+[a-zàèéìòù]+)*)\s+punti?\s+(?:a|ad)\s+(.+)/i,
    /dai\s+(\d+)\s+punti?\s+(?:a|ad)\s+(.+)/i,
    /dai\s+([a-zàèéìòù]+(?:\s+[a-zàèéìòù]+)*)\s+punti?\s+(?:a|ad)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [, pointsOrWords, playerName] = match;
      
      let points: number;
      if (/^\d+$/.test(pointsOrWords)) {
        points = parseInt(pointsOrWords, 10);
      } else {
        points = convertWordToNumber(pointsOrWords);
      }

      if (points > 0 && playerName) {
        return {
          playerName: normalizePlayerName(playerName.trim()),
          points,
        };
      }
    }
  }

  return null;
}

function matchShowPoints(text: string): { playerName: string | null } | null {
  const patterns = [
    /mostra\s+punti\s+(?:di|del|a)\s+(.+)/i,
    /visualizza\s+punti\s+(?:di|del|a)\s+(.+)/i,
    /quanti\s+punti\s+(?:ha|a)\s+(.+)/i,
    /punti\s+(?:di|del)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const playerName = normalizePlayerName(match[1].trim());
      return { playerName };
    }
  }

  return null;
}

function convertWordToNumber(text: string): number | 0 {
  const words = text.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const value = NUMBER_WORDS[word.toLowerCase()];
    if (value === undefined) continue;

    if (value >= 100) {
      if (current > 0) {
        total += current * value;
      } else {
        total += value;
      }
      current = 0;
    } else {
      current += value;
    }
  }

  return total + current;
}

function normalizePlayerName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function findPlayerByName(
  name: string,
  players: Array<{ first_name: string; last_name: string; id: number }>
): { first_name: string; last_name: string; id: number } | null {
  const normalized = normalizePlayerName(name);
  const searchTerms = normalized.toLowerCase().split(' ');

  let bestMatch: { first_name: string; last_name: string; id: number } | null = null;
  let bestScore = 0;

  for (const player of players) {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      if (player.first_name.toLowerCase().includes(term)) score++;
      if (player.last_name.toLowerCase().includes(term)) score++;
      if (fullName.includes(term)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = player;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}