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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">플레이어</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.userId}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.userId === currentDrawerId
                ? 'bg-blue-100 border-2 border-blue-500'
                : player.status === 'answered'
                ? 'bg-green-50'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* 순위 */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                {index + 1}
              </div>

              {/* 닉네임 */}
              <div>
                <p className="font-semibold text-gray-900">
                  {player.nickname}
                  {player.isHost && (
                    <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                      HOST
                    </span>
                  )}
                  {player.userId === currentDrawerId && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      그리는 중
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {player.status === 'answered' ? '정답!' : player.status === 'guessing' ? '맞추는 중' : player.status === 'drawing' ? '그리는 중' : '대기 중'}
                </p>
              </div>
            </div>

            {/* 점수 */}
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">{player.score}</p>
              <p className="text-xs text-gray-500">점</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
