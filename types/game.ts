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
  points: number;
}

export interface PlayerScore {
  name: string;
  score: number;
  points: number;
  time: number;
  timestamp: number;
  sessionId?: string; // Session/class identifier
}

export interface GameMasterState {
  isGameMaster: boolean;
  timeLimit: number | null; // in seconds
  gameEndTime: number | null;
  isGameEnded: boolean;
}

