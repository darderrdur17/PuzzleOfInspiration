export type Phase = "preparation" | "incubation" | "illumination" | "verification";

export interface Quote {
  id: string;
  text: string;
  author: string;
  phase: Phase;
}

export interface PhaseTitle {
  id: string;
  title: string;
  phase: Phase;
}

export interface GameState {
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  userAnswer: string;
  placements: Record<string, Phase>;
  titlePlacements: Record<string, Phase>;
}

export interface PlayerScore {
  name: string;
  score: number;
  time: number;
  timestamp: number;
}

