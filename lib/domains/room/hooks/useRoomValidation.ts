/**
 * useRoomValidation Hook
 * 방 유효성 검증 공통 로직
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Room } from '@/types';

interface UseRoomValidationProps {
  room: Room | null;
  roomLoading: boolean;
  roomCode: string;
}

export function useRoomValidation({
  room,
  roomLoading,
  roomCode,
}: UseRoomValidationProps) {
  const router = useRouter();

  useEffect(() => {
    if (!roomCode) return;
    if (roomLoading) return;

    if (!room) {
      alert('존재하지 않는 방입니다.');
      router.push('/');
    }
  }, [room, roomLoading, roomCode, router]);
}
