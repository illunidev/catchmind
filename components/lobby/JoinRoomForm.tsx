/**
 * JoinRoomForm Component
 * 방 참가 폼 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { GAME_CONSTANTS } from '@/lib/utils/constants';

interface JoinRoomFormProps {
  onJoinRoom: (roomCode: string) => void;
  loading?: boolean;
}

export function JoinRoomForm({ onJoinRoom, loading = false }: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    const code = roomCode.trim().toUpperCase();

    if (code.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH) {
      setError(`방 코드는 ${GAME_CONSTANTS.ROOM_CODE_LENGTH}자여야 합니다.`);
      return;
    }

    onJoinRoom(code);
  };

  const handleCodeChange = (value: string) => {
    // 대문자와 숫자만 허용
    const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(filtered);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="space-y-4">
        <Input
          label="방 코드"
          value={roomCode}
          onChange={handleCodeChange}
          placeholder="예: KF652739"
          maxLength={GAME_CONSTANTS.ROOM_CODE_LENGTH}
          error={error}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || roomCode.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH}
          className="w-full"
        >
          {loading ? '참가 중...' : '방 참가하기'}
        </Button>
      </div>
    </form>
  );
}
