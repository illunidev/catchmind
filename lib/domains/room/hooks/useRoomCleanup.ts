/**
 * 방 자동 정리 Hook
 * - 종료된 방을 주기적으로 정리
 */

'use client';

import { useEffect } from 'react';
import { roomService } from '../services/roomService';

/**
 * 방 자동 정리 Hook
 * @param intervalMs 정리 주기 (기본값: 1분)
 * @param timeoutMs 종료 후 대기 시간 (기본값: 5분)
 */
export function useRoomCleanup(
  intervalMs: number = 60 * 1000,
  timeoutMs: number = 5 * 60 * 1000
) {
  useEffect(() => {
    // 초기 정리
    roomService.cleanupFinishedRooms(timeoutMs);

    // 주기적 정리
    const interval = setInterval(() => {
      roomService.cleanupFinishedRooms(timeoutMs);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, timeoutMs]);
}
