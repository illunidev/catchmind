/**
 * Answer Domain Types
 * 정답 처리 관련 타입 정의
 */

export interface RoundAnswer {
  id: string;
  roundId: string;
  userId: string;
  answerText: string;
  isCorrect: boolean;
  orderIndex?: number;
  scoreGain: number;
  answeredAt: number;
}

export interface AnswerCheckResult {
  isCorrect: boolean;
  orderIndex?: number;
  scoreGain: number;
}
