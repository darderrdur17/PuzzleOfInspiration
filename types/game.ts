export type Phase = "preparation" | "incubation" | "illumination" | "verification";
export type ThemeId = "classic" | "science" | "art" | "entrepreneurship";
export type ChallengeMode = "normal" | "double-points" | "rapid-fire";

export interface RapidFireQuestion {
  id: string;
  theme: ThemeId;
  question: string;
  options: readonly string[];
  answerIndex: number;
  phase?: Phase;
}

export interface SharedHint {
  id: string;
  phase: Phase;
  message: string;
  activatedBy: string;
  cost: number;
  timestamp: number;
}

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

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  boardBackground: string;
  badgeColor: string;
  phaseHints: Record<Phase, string>;
  quotes: readonly Quote[];
  rapidFireQuestions: RapidFireQuestion[];
}

