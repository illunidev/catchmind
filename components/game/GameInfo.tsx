/**
 * GameInfo Component
 * 게임 정보 표시 (라운드, 타이머, 힌트 등)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GameState, Round } from '@/types/game';

interface GameInfoProps {
  gameState: GameState | null;
  currentRound: Round | null;
  isDrawer: boolean;
}

export function GameInfo({ gameState, currentRound, isDrawer }: GameInfoProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  // 타이머 업데이트
  useEffect(() => {
    if (!currentRound || gameState?.status !== 'drawing') {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - currentRound.startTime;
      const remaining = Math.max(0, currentRound.timeLimit - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentRound, gameState?.status]);

  // 힌트 생성 (단어 길이 표시)
  const getHint = () => {
    if (!currentRound || isDrawer) return '';

    const wordLength = currentRound.word.length;

    // 시간에 따라 힌트 공개
    const progress = timeLeft / currentRound.timeLimit;

    if (progress > 0.7) {
      return `${'_ '.repeat(wordLength)}`;
    } else if (progress > 0.4) {
      // 첫 글자 공개
      const firstChar = currentRound.word[0];
      return `${firstChar} ${'_ '.repeat(wordLength - 1)}`;
    } else {
      // 첫 글자와 마지막 글자 공개
      const firstChar = currentRound.word[0];
      const lastChar = currentRound.word[wordLength - 1];
      return `${firstChar} ${'_ '.repeat(wordLength - 2)}${lastChar}`;
    }
  };

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      food: '음식',
      animal: '동물',
      object: '사물',
      action: '행동',
    };
    return categoryNames[category] || category;
  };

  const getTimerColor = () => {
    const progress = currentRound ? timeLeft / currentRound.timeLimit : 0;
    if (progress > 0.5) return 'text-green-600';
    if (progress > 0.25) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!gameState) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      {/* 라운드 정보 */}
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            라운드 {gameState.currentRound} / {gameState.totalRounds}
          </h2>
        </div>

        {/* 타이머 */}
        {currentRound && gameState.status === 'drawing' && (
          <div className={`text-2xl sm:text-4xl font-bold ${getTimerColor()}`}>
            {timeLeft}초
          </div>
        )}
      </div>

      {/* 게임 상태 및 힌트 */}
      <div className="space-y-2">
        {gameState.status === 'waiting' && (
          <p className="text-base sm:text-lg text-gray-600 text-center py-2 sm:py-4">
            다음 라운드를 준비 중입니다...
          </p>
        )}

        {gameState.status === 'drawing' && currentRound && (
          <>
            {isDrawer ? (
              <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2">출제 단어:</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-900">
                  {currentRound.word}
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">힌트:</p>
                <p className="text-lg sm:text-2xl font-mono text-gray-900">
                  {getHint()}
                </p>
              </div>
            )}
          </>
        )}

        {gameState.status === 'finished' && (
          <p className="text-base sm:text-lg text-gray-600 text-center py-2 sm:py-4">
            게임이 종료되었습니다!
          </p>
        )}
      </div>
    </div>
  );
}
