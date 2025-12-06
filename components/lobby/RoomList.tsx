/**
 * RoomList Component
 * 방 목록 표시 컴포넌트
 */

'use client';

import React from 'react';
import { Room } from '@/types';
import { Button } from '@/components/shared/Button';

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomCode: string) => void;
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">현재 참가 가능한 방이 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">새로운 방을 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{room.title}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {room.code}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>
                    {room.currentPlayers}/{room.maxPlayers}
                  </span>
                </div>

                {room.settings.category && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {getCategoryName(room.settings.category)}
                  </span>
                )}

                {room.settings.difficulty && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {getDifficultyName(room.settings.difficulty)}
                  </span>
                )}
              </div>
            </div>

            <Button
              onClick={() => onJoinRoom(room.code)}
              size="sm"
              disabled={room.currentPlayers >= room.maxPlayers}
            >
              {room.currentPlayers >= room.maxPlayers ? '가득참' : '참가'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    all: '전체',
    food: '음식',
    animal: '동물',
    object: '사물',
    action: '행동',
  };
  return names[category] || category;
}

function getDifficultyName(difficulty: string): string {
  const names: Record<string, string> = {
    easy: '쉬움',
    normal: '보통',
    hard: '어려움',
  };
  return names[difficulty] || difficulty;
}
