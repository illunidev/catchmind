/**
 * Game Service
 * 게임 로직 관리 서비스
 */

import { GameState, Round, FinalRanking, GamePhase } from '@/types/game';
import { Player } from '@/types/room';
import { setData, updateData, getData, removeData } from '@/lib/firebase/database';
import { GAME_CONSTANTS, SCORE_CONSTANTS } from '@/lib/utils/constants';
import { calculateRoundScore, shuffle } from '@/lib/utils/helpers';
import { canvasService } from '../../canvas/services/canvasService';

export class GameService {
  /**
   * 게임 시작
   */
  async startGame(roomCode: string, players: Player[]): Promise<GameState> {
    // 플레이어 순서 섞기
    const shuffledPlayers = shuffle([...players]);
    const drawOrder = shuffledPlayers.map(p => p.userId);

    const gameState: GameState = {
      status: 'drawing',  // 게임 시작 시 drawing 상태
      currentRound: 1,  // 첫 번째 라운드부터 시작
      totalRounds: calculateTotalRounds(players.length),
      drawOrder,
      startedAt: Date.now(),
    };

    await setData(`gameStates/${roomCode}`, gameState);
    return gameState;
  }

  /**
   * 라운드 시작
   */
  async startRound(
    roomCode: string,
    roundNumber: number,
    drawerId: string,
    word: string,
    category: string
  ): Promise<Round> {
    const round: Round = {
      roundNumber,
      drawerId,
      word,
      category,
      startTime: Date.now(),
      timeLimit: GAME_CONSTANTS.ROUND_TIME_LIMIT,
      answers: [],
    };

    await updateData(`gameStates/${roomCode}`, {
      status: 'drawing' as GamePhase,
      currentRound: roundNumber,
    });

    await setData(`rounds/${roomCode}/${roundNumber}`, round);

    return round;
  }

  /**
   * 정답 제출
   */
  async submitAnswer(
    roomCode: string,
    roundNumber: number,
    userId: string,
    answer: string,
    correctWord: string
  ): Promise<boolean> {
    const isCorrect = answer.trim().toLowerCase() === correctWord.toLowerCase();
    const round = await getData<Round>(`rounds/${roomCode}/${roundNumber}`);

    if (!round) {
      throw new Error('라운드를 찾을 수 없습니다.');
    }

    const elapsedTime = Date.now() - round.startTime;
    const answerOrder = (round.answers?.length || 0) + 1;

    // 점수 계산
    let score = 0;
    if (isCorrect) {
      score = calculateRoundScore(elapsedTime, round.timeLimit, answerOrder);
    }

    // 정답 기록
    const answerData = {
      userId,
      answer,
      isCorrect,
      timestamp: Date.now(),
      score,
    };

    await updateData(`rounds/${roomCode}/${roundNumber}`, {
      [`answers/${userId}`]: answerData,
    });

    return isCorrect;
  }

  /**
   * 라운드 종료
   */
  async endRound(roomCode: string, roundNumber: number): Promise<void> {
    const round = await getData<Round>(`rounds/${roomCode}/${roundNumber}`);
    if (!round) return;

    // 라운드 결과 저장
    await updateData(`rounds/${roomCode}/${roundNumber}`, {
      endTime: Date.now(),
    });

    // 게임 상태를 대기로 변경
    await updateData(`gameStates/${roomCode}`, {
      status: 'waiting' as GamePhase,
    });
  }

  /**
   * 다음 라운드로 진행
   */
  async startNextRound(roomCode: string, nextRoundNumber: number): Promise<void> {
    // 캔버스 초기화
    await canvasService.clearCanvas(roomCode);

    // 다음 라운드로 상태 업데이트
    await updateData(`gameStates/${roomCode}`, {
      status: 'drawing' as GamePhase,
      currentRound: nextRoundNumber,
    });
  }

  /**
   * 게임 종료 및 최종 순위 계산
   */
  async endGame(roomCode: string): Promise<FinalRanking[]> {
    const gameState = await getData<GameState>(`gameStates/${roomCode}`);
    if (!gameState) {
      throw new Error('게임 상태를 찾을 수 없습니다.');
    }

    // 모든 라운드 결과 가져오기
    const rounds = await getData<Record<string, Round>>(`rounds/${roomCode}`);
    if (!rounds) {
      throw new Error('라운드 정보를 찾을 수 없습니다.');
    }

    // 플레이어별 점수 집계
    const playerScores: Record<string, number> = {};

    Object.values(rounds).forEach((round) => {
      if (!round.answers) return;

      Object.entries(round.answers).forEach(([userId, answer]) => {
        if (!playerScores[userId]) {
          playerScores[userId] = 0;
        }
        playerScores[userId] += answer.score;
      });

      // 그린 사람 보너스
      const correctAnswers = Object.values(round.answers).filter(a => a.isCorrect).length;
      if (correctAnswers > 0) {
        if (!playerScores[round.drawerId]) {
          playerScores[round.drawerId] = 0;
        }
        playerScores[round.drawerId] += SCORE_CONSTANTS.DRAWER_BONUS * correctAnswers;
      }
    });

    // 순위 생성
    const rankings: FinalRanking[] = Object.entries(playerScores)
      .map(([userId, totalScore]) => ({
        userId,
        totalScore,
        rank: 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // 최종 순위 저장
    await setData(`gameResults/${roomCode}`, {
      rankings,
      endedAt: Date.now(),
    });

    // 게임 상태 업데이트
    await updateData(`gameStates/${roomCode}`, {
      status: 'finished' as GamePhase,
    });

    return rankings;
  }

  /**
   * 게임 상태 가져오기
   */
  async getGameState(roomCode: string): Promise<GameState | null> {
    return await getData<GameState>(`gameStates/${roomCode}`);
  }

  /**
   * 라운드 정보 가져오기
   */
  async getRound(roomCode: string, roundNumber: number): Promise<Round | null> {
    return await getData<Round>(`rounds/${roomCode}/${roundNumber}`);
  }

  /**
   * 최종 순위 가져오기
   */
  async getFinalRankings(roomCode: string): Promise<FinalRanking[] | null> {
    const result = await getData<{ rankings: FinalRanking[] }>(`gameResults/${roomCode}`);
    return result?.rankings || null;
  }

  /**
   * 게임 데이터 초기화 (방 재시작용)
   */
  async resetGame(roomCode: string): Promise<void> {
    await removeData(`gameStates/${roomCode}`);
    await removeData(`rounds/${roomCode}`);
    await removeData(`gameResults/${roomCode}`);
  }
}

/**
 * 총 라운드 수 계산
 */
function calculateTotalRounds(playerCount: number): number {
  return Math.min(
    playerCount * GAME_CONSTANTS.ROUNDS_PER_PLAYER,
    GAME_CONSTANTS.MAX_ROUNDS
  );
}

// Singleton instance
export const gameService = new GameService();
