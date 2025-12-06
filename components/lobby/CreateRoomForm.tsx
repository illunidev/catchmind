/**
 * CreateRoomForm Component
 * 방 생성 폼 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { RoomSettings } from '@/types';
import { GAME_CONSTANTS } from '@/lib/utils/constants';

interface CreateRoomFormProps {
  onCreateRoom: (title: string, settings: RoomSettings) => void;
  loading?: boolean;
}

export function CreateRoomForm({ onCreateRoom, loading = false }: CreateRoomFormProps) {
  const [title, setTitle] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [category, setCategory] = useState<RoomSettings['category']>('all');
  const [difficulty, setDifficulty] = useState<RoomSettings['difficulty']>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    onCreateRoom(title.trim(), {
      maxPlayers,
      category,
      difficulty,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 sm:space-y-4">
      <Input
        label="방 제목"
        value={title}
        onChange={setTitle}
        placeholder="방 제목을 입력하세요"
        maxLength={50}
        disabled={loading}
      />

      <div>
        <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">
          최대 인원
        </label>
        <select
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          disabled={loading}
          className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from(
            { length: GAME_CONSTANTS.MAX_PLAYERS - GAME_CONSTANTS.MIN_PLAYERS + 1 },
            (_, i) => GAME_CONSTANTS.MIN_PLAYERS + i
          ).map((num) => (
            <option key={num} value={num}>
              {num}명
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">
          카테고리
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RoomSettings['category'])}
          disabled={loading}
          className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="food">음식</option>
          <option value="animal">동물</option>
          <option value="object">사물</option>
          <option value="action">행동</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">
          난이도
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as RoomSettings['difficulty'])}
          disabled={loading}
          className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">쉬움</option>
          <option value="normal">보통</option>
          <option value="hard">어려움</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full"
      >
        {loading ? '방 생성 중...' : '방 만들기'}
      </Button>
    </form>
  );
}
