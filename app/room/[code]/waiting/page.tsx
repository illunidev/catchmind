/**
 * Waiting Room Page
 * 대기실 페이지 - /room/[code]/waiting
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoom } from '@/lib/domains/room/hooks/useRoom';
import { useRoomValidation } from '@/lib/domains/room/hooks/useRoomValidation';
import { useGame } from '@/lib/domains/game/hooks/useGame';
import { roomService } from '@/lib/domains/room/services/roomService';
import { chatService } from '@/lib/domains/chat/services/chatService';
import { RoomHeader } from '@/components/game/RoomHeader';
import { GameWaitingRoom } from '@/components/game/GameWaitingRoom';
import { Loading } from '@/components/shared/Loading';

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  const { user, loading: userLoading } = useUser();
  const { room, players, loading: roomLoading } = useRoom(roomCode, user?.id);
  const { gameState, startGame } = useGame(roomCode);
  const [error, setError] = useState('');

  // 로그인 체크
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // 방 유효성 체크
  useRoomValidation({ room, roomLoading, roomCode });

  // 게임 시작 시 자동 이동
  useEffect(() => {
    if (!gameState) return;  // gameState가 null이면 무시

    if (gameState.status === 'drawing') {
      router.replace(`/room/${roomCode}/playing`);
    } else if (gameState.status === 'finished') {
      router.replace(`/room/${roomCode}/finished`);
    }
  }, [gameState, roomCode, router]);

  if (userLoading || roomLoading || !user || !room) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로딩 중..." />
      </main>
    );
  }

  const currentPlayer = players.find((p) => p.userId === user.id);
  const isHost = currentPlayer?.isHost || false;

  const handleStartGame = async () => {
    // 방장이 아니면 리턴
    if (!isHost) return;

    // 이미 게임이 진행 중(drawing)이거나 종료(finished)되었으면 리턴
    if (gameState && (gameState.status === 'drawing' || gameState.status === 'finished')) {
      return;
    }

    try {
      setError('');
      await startGame(players);
      await chatService.sendSystemMessage(roomCode, '게임이 시작됩니다!');
      router.push(`/room/${roomCode}/playing`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;

    await roomService.leaveRoom(user.id, room.id);
    await chatService.sendSystemMessage(roomCode, `${user.nickname}님이 방을 나갔습니다.`);
    localStorage.removeItem('currentRoomId');
    localStorage.removeItem('currentRoomCode');
    router.push('/lobby');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <RoomHeader room={room} onLeave={handleLeaveRoom} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <GameWaitingRoom
          players={players}
          isHost={isHost}
          onStartGame={handleStartGame}
        />
      </div>
    </main>
  );
}
