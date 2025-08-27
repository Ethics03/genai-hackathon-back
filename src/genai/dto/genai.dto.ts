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
