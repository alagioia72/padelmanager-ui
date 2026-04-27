import type { SpeechError, SpeechResult } from './types';

type SpeechCallbacks = {
  onResult: (result: SpeechResult) => void;
  onError: (error: SpeechError) => void;
  onEnd: () => void;
};

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private callbacks: SpeechCallbacks | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'it-IT';
        this.recognition.maxAlternatives = 1;
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  get isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(callbacks: SpeechCallbacks): void {
    if (!this.recognition) {
      callbacks.onError({
        message: 'Il riconoscimento vocale non è supportato da questo browser.',
        code: 'not_supported',
      });
      return;
    }

    this.callbacks = callbacks;
    this.isListening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      callbacks.onResult({
        transcript,
        confidence,
        isFinal: result.isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      const errorMap: Record<string, SpeechError['code']> = {
        'not-allowed': 'permission_denied',
        'no-speech': 'no_result',
        'network': 'network',
      };

      callbacks.onError({
        message: this.getErrorMessage(event.error),
        code: errorMap[event.error] || 'unknown',
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd();
    };

    try {
      this.recognition.start();
    } catch {
      callbacks.onError({
        message: 'Impossibile avviare il riconoscimento vocale.',
        code: 'unknown',
      });
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, lang = 'it-IT', onEnd?: () => void): void {
    if (!this.synthesis) return;

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = this.synthesis.getVoices();
    const italianVoice = voices.find((v) => v.lang.startsWith('it')) || voices.find((v) => v.lang.startsWith(lang));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
    }

    this.synthesis.speak(utterance);
  }

  private getErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      'not-allowed': 'Accesso al microfono negato. Controlla le impostazioni del browser.',
      'no-speech': 'Nessun parlato rilevato. Riprova.',
      'network': 'Errore di rete durante il riconoscimento.',
      'aborted': 'Riconoscimento interrotto.',
    };
    return messages[error] || 'Errore sconosciuto durante il riconoscimento vocale.';
  }
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const speechService = new SpeechService();