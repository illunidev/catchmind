/**
 * useGame Hook
 * 게임 상태 관리 훅
 */

'use client';

import { useEffect, useState } from 'react';
import { GameState, Round, FinalRanking } from '@/types/game';
import { listenToValue } from '@/lib/firebase/database';
import { gameService } from '../services/gameService';

export function useGame(roomCode: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [finalRankings, setFinalRankings] = useState<FinalRanking[] | null>(null);
  const [loading, setLoading] = useState(true);

  // 게임 상태 리스너
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = listenToValue(
      `gameStates/${roomCode}`,
      (snapshot) => {
        const data = snapshot.val() as GameState | null;
        setGameState(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  // 현재 라운드 리스너
  useEffect(() => {
    if (!roomCode || !gameState?.currentRound) return;

    const unsubscribe = listenToValue(
      `rounds/${roomCode}/${gameState.currentRound}`,
      (snapshot) => {
        const data = snapshot.val() as Round | null;
        setCurrentRound(data);
      }
    );

    return () => unsubscribe();
  }, [roomCode, gameState?.currentRound]);

  // 최종 순위 리스너
  useEffect(() => {
    if (!roomCode || gameState?.status !== 'finished') return;

    const unsubscribe = listenToValue(
      `gameResults/${roomCode}`,
      (snapshot) => {
        const data = snapshot.val() as { rankings: FinalRanking[] } | null;
        setFinalRankings(data?.rankings || null);
      }
    );

    return () => unsubscribe();
  }, [roomCode, gameState?.status]);

  /**
   * 게임 시작
   */
  const startGame = async (players: any[]) => {
    try {
      await gameService.startGame(roomCode, players);
    } catch (error) {
      console.error('게임 시작 실패:', error);
      throw error;
    }
  };

  /**
   * 라운드 시작
   */
  const startRound = async (
    roundNumber: number,
    drawerId: string,
    word: string,
    category: string
  ) => {
    try {
      await gameService.startRound(roomCode, roundNumber, drawerId, word, category);
    } catch (error) {
      console.error('라운드 시작 실패:', error);
      throw error;
    }
  };

  /**
   * 정답 제출
   */
  const submitAnswer = async (
    userId: string,
    answer: string,
    correctWord: string
  ) => {
    if (!gameState?.currentRound) {
      throw new Error('현재 라운드가 없습니다.');
    }

    try {
      return await gameService.submitAnswer(
        roomCode,
        gameState.currentRound,
        userId,
        answer,
        correctWord
      );
    } catch (error) {
      console.error('정답 제출 실패:', error);
      throw error;
    }
  };

  /**
   * 라운드 종료
   */
  const endRound = async () => {
    if (!gameState?.currentRound) return;

    try {
      await gameService.endRound(roomCode, gameState.currentRound);
    } catch (error) {
      console.error('라운드 종료 실패:', error);
      throw error;
    }
  };

  /**
   * 게임 종료
   */
  const endGame = async () => {
    try {
      await gameService.endGame(roomCode);
    } catch (error) {
      console.error('게임 종료 실패:', error);
      throw error;
    }
  };

  /**
   * 게임 재시작
   */
  const resetGame = async () => {
    try {
      await gameService.resetGame(roomCode);
    } catch (error) {
      console.error('게임 초기화 실패:', error);
      throw error;
    }
  };

  return {
    gameState,
    currentRound,
    finalRankings,
    loading,
    startGame,
    startRound,
    submitAnswer,
    endRound,
    endGame,
    resetGame,
  };
}
