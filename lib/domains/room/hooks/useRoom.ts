/**
 * useRoom Hook
 * 특정 방의 실시간 상태 관리
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Room, Player, UpdateRoomSettingsInput } from '@/types';
import { roomService } from '../services/roomService';
import { listenToValue } from '@/lib/firebase/database';
import { setupPresence } from '@/lib/firebase/presence';

interface UseRoomReturn {
  room: Room | null;
  players: Player[];
  loading: boolean;
  error: Error | null;
  isHost: (userId: string) => boolean;
  updateSettings: (settings: UpdateRoomSettingsInput) => Promise<void>;
}

export function useRoom(
  roomCode: string,
  userId?: string
): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // roomCode로 room 찾기 및 리스너 설정
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // rooms 전체를 리스닝하면서 해당 code를 가진 방 찾기
    const unsubscribeRooms = listenToValue('rooms', (snapshot) => {
      if (snapshot.exists()) {
        const rooms = snapshot.val() as Record<string, Room>;
        const foundRoom = Object.values(rooms).find((r) => r.code === roomCode);

        if (foundRoom) {
          setRoom(foundRoom);
          setRoomId(foundRoom.id);
        } else {
          setRoom(null);
          setRoomId(null);
        }
      } else {
        setRoom(null);
        setRoomId(null);
      }
      setLoading(false);
    });

    // Cleanup
    return () => {
      unsubscribeRooms();
    };
  }, [roomCode]);

  // roomId가 확정되면 플레이어 목록 리스닝
  useEffect(() => {
    if (!roomId) return;

    const unsubscribePlayers = listenToValue(
      `roomDetails/${roomId}/players`,
      (snapshot) => {
        if (snapshot.exists()) {
          const playersData = snapshot.val();
          setPlayers(Object.values(playersData));
        } else {
          setPlayers([]);
        }
      }
    );

    // Presence 설정 (userId가 있을 때만)
    if (userId) {
      setupPresence(roomId, userId);
    }

    // Cleanup
    return () => {
      unsubscribePlayers();
    };
  }, [roomId, userId]);

  // 방장 여부 확인
  const isHost = useCallback(
    (userId: string): boolean => {
      return room?.hostUserId === userId;
    },
    [room]
  );

  // 방 설정 업데이트
  const updateSettings = useCallback(
    async (settings: UpdateRoomSettingsInput) => {
      if (!room || !userId) {
        throw new Error('방 정보 또는 유저 정보가 없습니다.');
      }

      try {
        await roomService.updateSettings(room.id, userId, settings);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [room, userId]
  );

  return {
    room,
    players,
    loading,
    error,
    isHost,
    updateSettings,
  };
}
