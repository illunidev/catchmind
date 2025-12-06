/**
 * Finished Room Page
 * 게임 종료 페이지 - /room/[code]/finished
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoom } from '@/lib/domains/room/hooks/useRoom';
import { useRoomValidation } from '@/lib/domains/room/hooks/useRoomValidation';
import { useGame } from '@/lib/domains/game/hooks/useGame';
import { roomService } from '@/lib/domains/room/services/roomService';
import { chatService } from '@/lib/domains/chat/services/chatService';
import { RoomHeader } from '@/components/game/RoomHeader';
import { GameFinishedRoom } from '@/components/game/GameFinishedRoom';
import { Loading } from '@/components/shared/Loading';

export default function FinishedRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  const { user, loading: userLoading } = useUser();
  const { room, players, loading: roomLoading } = useRoom(roomCode, user?.id);
  const { gameState } = useGame(roomCode);

  // 로그인 체크
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // 방 유효성 체크
  useRoomValidation({ room, roomLoading, roomCode });

  // 게임 상태 체크
  useEffect(() => {
    if (!gameState) return; // 로딩 중에는 대기

    if (gameState.status !== 'finished') {
      if (gameState.status === 'waiting') {
        router.replace(`/room/${roomCode}/waiting`);
      } else if (gameState.status === 'drawing') {
        router.replace(`/room/${roomCode}/playing`);
      }
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

  const handleBackToLobby = async () => {
    if (!room) return;

    await roomService.leaveRoom(user.id, room.id);
    await chatService.sendSystemMessage(roomCode, `${user.nickname}님이 방을 나갔습니다.`);
    localStorage.removeItem('currentRoomId');
    localStorage.removeItem('currentRoomCode');
    router.push('/lobby');
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        <RoomHeader room={room} onLeave={handleLeaveRoom} />

        <GameFinishedRoom
          players={players}
          isHost={isHost}
          currentUserId={user.id}
          onBackToLobby={handleBackToLobby}
        />
      </div>
    </main>
  );
}
