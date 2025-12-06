/**
 * useRoomList Hook
 * 방 목록 실시간 조회 훅
 */

'use client';

import { useEffect, useState } from 'react';
import { Room } from '@/types';
import { listenToValue } from '@/lib/firebase/database';

export function useRoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToValue('rooms', (snapshot) => {
      const data = snapshot.val() as Record<string, Room> | null;

      if (!data) {
        setRooms([]);
        setLoading(false);
        return;
      }

      // 대기 중인 방만 필터링하고 최신순 정렬
      const roomList = Object.values(data)
        .filter((room) => room.status === 'waiting')
        .sort((a, b) => b.createdAt - a.createdAt);

      setRooms(roomList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { rooms, loading };
}
