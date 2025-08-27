export interface BinauralBeatsResponse {
  message: string;
  audioStream: string;
  sessionInfo: {
    mood: string;
    duration: number;
    baseFrequency: number;
    beatFrequency: number;
    description: string;
  };
}

export class BinauralBeatsRequest {
  mood: string;
  sessionDuration: number; // in minutes
  additionalInstructions?: string;
}

export interface MoodConfig {
  carrier: number; // base audible frequency
  beat: number; // binaural beat difference
  description: string;
  bpm: number;
}

export const MOOD_CONFIGS: Record<string, MoodConfig> = {
  relaxation: {
    carrier: 200,
    beat: 8,
    description: 'Alpha waves for deep relaxation',
    bpm: 60,
  },
  meditation: {
    carrier: 250,
    beat: 6,
    description: 'Theta waves for meditative state',
    bpm: 50,
  },
  focus: {
    carrier: 220,
    beat: 12,
    description: 'SMR waves for enhanced focus',
    bpm: 70,
  },
  sleep: {
    carrier: 150,
    beat: 3,
    description: 'Delta waves for deep sleep',
    bpm: 40,
  },
  energy: {
    carrier: 250,
    beat: 20,
    description: 'Beta waves for increased energy',
    bpm: 120,
  },
  anxiety: {
    carrier: 200,
    beat: 7,
    description: 'Alpha waves for anxiety relief',
    bpm: 65,
  },
  creativity: {
    carrier: 220,
    beat: 10,
    description: 'Alpha-Theta for creative flow',
    bpm: 80,
  },
  healing: {
    carrier: 250,
    beat: 4,
    description: 'Theta waves for healing',
    bpm: 45,
  },
  concentration: {
    carrier: 220,
    beat: 14,
    description: 'Beta waves for concentration',
    bpm: 85,
  },
  confidence: {
    carrier: 250,
    beat: 16,
    description: 'Beta waves for confidence building',
    bpm: 90,
  },
};
