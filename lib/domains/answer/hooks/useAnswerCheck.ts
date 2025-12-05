/**
 * useAnswerCheck Hook
 * 정답 체크 로직 훅
 */

'use client';

import { useCallback, useState } from 'react';
import { AnswerCheckResult } from '@/types/answer';
import { answerService } from '../services/answerService';

export function useAnswerCheck() {
  const [lastResult, setLastResult] = useState<AnswerCheckResult | null>(null);

  /**
   * 정답 체크
   */
  const checkAnswer = useCallback((userAnswer: string, correctAnswer: string): AnswerCheckResult => {
    const result = answerService.checkAnswer(userAnswer, correctAnswer);
    setLastResult(result);
    return result;
  }, []);

  /**
   * 결과 초기화
   */
  const resetResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    checkAnswer,
    lastResult,
    resetResult,
  };
}
