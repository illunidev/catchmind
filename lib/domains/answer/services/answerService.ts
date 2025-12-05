/**
 * Answer Service
 * 정답 검증 및 유사도 체크 서비스
 */

import { AnswerCheckResult } from '@/types/answer';

export class AnswerService {
  /**
   * 정답 검증
   */
  checkAnswer(userAnswer: string, correctAnswer: string): AnswerCheckResult {
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(correctAnswer);

    // 완전 일치
    if (normalizedUser === normalizedCorrect) {
      return {
        isCorrect: true,
        similarity: 100,
      };
    }

    // 유사도 계산
    const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);

    // 유사도가 80% 이상이면 힌트 제공
    if (similarity >= 80) {
      return {
        isCorrect: false,
        similarity,
        hint: '비슷해요!',
      };
    }

    // 일부 포함 체크
    if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
      return {
        isCorrect: false,
        similarity,
        hint: '거의 다 왔어요!',
      };
    }

    return {
      isCorrect: false,
      similarity,
    };
  }

  /**
   * 정답 정규화
   */
  private normalizeAnswer(answer: string): string {
    return answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '') // 공백 제거
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); // 특수문자 제거
  }

  /**
   * 레벤슈타인 거리 기반 유사도 계산
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 100;

    return Math.round(((maxLength - distance) / maxLength) * 100);
  }

  /**
   * 레벤슈타인 거리 계산
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // DP 테이블 생성
    const dp: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    // 초기화
    for (let i = 0; i <= len1; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      dp[0][j] = j;
    }

    // DP 계산
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,      // 삭제
            dp[i][j - 1] + 1,      // 삽입
            dp[i - 1][j - 1] + 1   // 교체
          );
        }
      }
    }

    return dp[len1][len2];
  }

  /**
   * 자음/모음 유사도 체크 (한글 전용)
   */
  private checkKoreanSimilarity(str1: string, str2: string): number {
    // 한글 자음/모음 분리 및 비교
    // 구현 예정: 초성, 중성, 종성 분리하여 유사도 계산
    return 0;
  }
}

// Singleton instance
export const answerService = new AnswerService();
