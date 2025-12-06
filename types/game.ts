/**
 * Game Domain Types
 * 게임 진행 관련 타입 정의
 */

export type GamePhase = 'waiting' | 'drawing' | 'finished';

export interface GameState {
  status: GamePhase;
  currentRound: number;
  totalRounds: number;
  drawOrder: string[];
  startedAt: number;
}

export interface Round {
  roundNumber: number;
  drawerId: string;
  word: string;
  startTime: number;
  timeLimit: number;
  answers?: Record<string, RoundAnswer>;
  endTime?: number;
}

export interface RoundAnswer {
  userId: string;
  answer: string;
  isCorrect: boolean;
  timestamp: number;
  score: number;
}

export interface FinalRanking {
  userId: string;
  totalScore: number;
  rank: number;
}
