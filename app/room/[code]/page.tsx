/**
 * Room Page - Redirect Handler
 * 게임 방 진입점 - 게임 상태에 따라 적절한 라우트로 리다이렉트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoom } from '@/lib/domains/room/hooks/useRoom';
import { useGame } from '@/lib/domains/game/hooks/useGame';
import { Loading } from '@/components/shared/Loading';

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const { user, loading: userLoading } = useUser();
  const { room, loading: roomLoading } = useRoom(roomCode);
  const { gameState } = useGame(roomCode);

  // params 처리
  useEffect(() => {
    params.then((p) => setRoomCode(p.code));
  }, [params]);

  // 로그인 체크
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // 방 유효성 체크 (재시도 로직 포함)
  useEffect(() => {
    if (!roomCode) return;
    if (roomLoading) return;

    // 로딩이 끝났는데 room이 없으면
    if (!room && !roomLoading) {
      // 최대 3번 재시도 (총 3초 대기)
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // 3번 재시도 후에도 없으면 진짜 없는 방
        alert('존재하지 않는 방입니다.');
        router.push('/');
      }
    } else if (room) {
      // 방을 찾았으면 재시도 카운트 리셋
      setRetryCount(0);
    }
  }, [room, roomLoading, roomCode, router, retryCount]);

  // 게임 상태에 따라 적절한 라우트로 리다이렉트
  useEffect(() => {
    if (!roomCode || !room) return;

    // 한 번만 리다이렉트 (무한 루프 방지)
    if (!gameState) {
      // 게임이 시작되지 않았으면 대기실로
      router.replace(`/room/${roomCode}/waiting`);
    } else if (gameState.status === 'finished') {
      // 게임이 종료되었으면 결과 화면으로
      router.replace(`/room/${roomCode}/finished`);
    } else {
      // 게임 진행 중이면 플레이 화면으로
      router.replace(`/room/${roomCode}/playing`);
    }
  }, [gameState, roomCode, room, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loading text="로딩 중..." />
    </main>
  );
}
