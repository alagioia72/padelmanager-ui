export type CommandIntent = 'add_points' | 'show_points' | 'cancel' | 'unknown';

export type ParsedCommand = {
  intent: CommandIntent;
  playerName: string | null;
  points: number | null;
  originalText: string;
};

export type SpeechError = {
  message: string;
  code: 'not_supported' | 'permission_denied' | 'no_result' | 'network' | 'unknown';
};

export type SpeechResult = {
  transcript: string;
  confidence: number;
  isFinal: boolean;
};