/**
 * RoomHeader Component
 * 방 정보 및 설정 표시
 */

'use client';

import React from 'react';
import { Room } from '@/types/room';
import { useRouter } from 'next/navigation';

interface RoomHeaderProps {
  room: Room;
  onLeave: () => void;
}

export function RoomHeader({ room, onLeave }: RoomHeaderProps) {
  const router = useRouter();

  const handleLeave = () => {
    if (confirm('정말 방을 나가시겠습니까?')) {
      onLeave();
      router.push('/');
    }
  };

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      all: '전체',
      food: '음식',
      animal: '동물',
      object: '사물',
      action: '행동',
    };
    return categoryNames[category] || category;
  };

  const getDifficultyName = (difficulty: string) => {
    const difficultyNames: Record<string, string> = {
      easy: '쉬움',
      normal: '보통',
      hard: '어려움',
    };
    return difficultyNames[difficulty] || difficulty;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              방 코드: {room.code}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
              {room.currentPlayers}/{room.settings.maxPlayers}명
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {getCategoryName(room.settings.category)}
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              {getDifficultyName(room.settings.difficulty)}
            </span>
          </div>
        </div>

        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          나가기
        </button>
      </div>
    </div>
  );
}
