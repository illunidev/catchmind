/**
 * PlayerList Component
 * 플레이어 목록 및 점수 표시 컴포넌트
 */

'use client';

import React from 'react';
import { Player } from '@/types/room';

interface PlayerListProps {
  players: Player[];
  currentDrawerId?: string;
}

export function PlayerList({ players, currentDrawerId }: PlayerListProps) {
  // 점수 순으로 정렬
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">플레이어</h3>
      <div className="space-y-1.5 sm:space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.userId}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
              player.userId === currentDrawerId
                ? 'bg-blue-100 border-2 border-blue-500'
                : player.status === 'answered'
                ? 'bg-green-50'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* 순위 */}
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 font-bold text-gray-700 text-sm sm:text-base flex-shrink-0">
                {index + 1}
              </div>

              {/* 닉네임 */}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {player.nickname}
                  {player.isHost && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                      HOST
                    </span>
                  )}
                  {player.userId === currentDrawerId && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                      그리는 중
                    </span>
                  )}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {player.status === 'answered' ? '정답!' : player.status === 'guessing' ? '맞추는 중' : player.status === 'drawing' ? '그리는 중' : '대기 중'}
                </p>
              </div>
            </div>

            {/* 점수 */}
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-lg sm:text-xl font-bold text-blue-600">{player.score}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">점</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
