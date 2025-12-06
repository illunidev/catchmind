/**
 * Playing Room Page
 * 게임 진행 페이지 - /room/[code]/playing
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoom } from '@/lib/domains/room/hooks/useRoom';
import { useRoomValidation } from '@/lib/domains/room/hooks/useRoomValidation';
import { useGame } from '@/lib/domains/game/hooks/useGame';
import { useAnswerCheck } from '@/lib/domains/answer/hooks/useAnswerCheck';
import { roomService } from '@/lib/domains/room/services/roomService';
import { gameService } from '@/lib/domains/game/services/gameService';
import { chatService } from '@/lib/domains/chat/services/chatService';
import { wordService } from '@/lib/domains/word/services/wordService';
import { RoomHeader } from '@/components/game/RoomHeader';
import { GamePlayingRoom } from '@/components/game/GamePlayingRoom';
import { WordChoiceModal } from '@/components/game/WordChoiceModal';
import { Loading } from '@/components/shared/Loading';
import { WordChoice } from '@/types/word';

export default function PlayingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  const { user, loading: userLoading } = useUser();
  const { room, players, loading: roomLoading } = useRoom(roomCode, user?.id);
  const { gameState, currentRound, startRound, submitAnswer, endRound } = useGame(roomCode);
  const { checkAnswer } = useAnswerCheck();

  const [showWordChoice, setShowWordChoice] = useState(false);
  const [wordChoices, setWordChoices] = useState<WordChoice[]>([]);
  const [error, setError] = useState('');

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
    if (!gameState) return;  // gameState가 null이면 로딩 중이므로 대기

    if (gameState.status === 'waiting') {
      router.replace(`/room/${roomCode}/waiting`);
    } else if (gameState.status === 'finished') {
      router.replace(`/room/${roomCode}/finished`);
    }
  }, [gameState, roomCode, router]);

  // 라운드 시작 시 단어 선택
  useEffect(() => {
    if (!gameState || !room || !user) return;
    if (!gameState.drawOrder || gameState.drawOrder.length === 0) return;

    console.log('🎮 Game State:', {
      currentRound: gameState.currentRound,
      status: gameState.status,
      drawOrder: gameState.drawOrder,
      hasCurrentRound: !!currentRound,
    });

    const drawerIndex = (gameState.currentRound - 1) % gameState.drawOrder.length;
    const drawerId = gameState.drawOrder[drawerIndex];

    console.log('🎨 Drawer Info:', {
      drawerIndex,
      drawerId,
      userId: user.id,
      isDrawer: drawerId === user.id,
    });

    if (!currentRound && gameState.status === 'drawing') {
      const choices = wordService.getWordChoices(room.settings);
      setWordChoices(choices);

      console.log('📝 Word choices generated:', choices);

      if (drawerId === user.id) {
        console.log('✅ Opening word choice modal for drawer');
        setShowWordChoice(true);
      }
    }
  }, [gameState, currentRound, room, user, players, roomCode]);

  if (userLoading || roomLoading || !user || !room || !gameState) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로딩 중..." />
      </main>
    );
  }

  const isDrawer = currentRound?.drawerId === user.id;

  const handleWordSelect = async (word: string) => {
    if (!gameState) return;

    setShowWordChoice(false);

    try {
      await startRound(gameState.currentRound, user.id, word);
      await chatService.sendSystemMessage(roomCode, '라운드가 시작되었습니다!');

      setTimeout(async () => {
        await handleRoundEnd();
      }, currentRound?.timeLimit ? currentRound.timeLimit * 1000 : 80000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentRound || isDrawer) return;

    try {
      const result = checkAnswer(answer, currentRound.word);

      if (result.isCorrect) {
        const isCorrect = await submitAnswer(user.id, answer, currentRound.word);

        if (isCorrect) {
          await chatService.sendAnswerMessage(roomCode, user.id, user.nickname, answer);
          await chatService.sendSystemMessage(
            roomCode,
            `${user.nickname}님이 정답을 맞췄습니다!`
          );

          const answeredPlayers = Object.keys(currentRound.answers || {}).length + 1;
          const totalPlayers = players.length - 1;

          if (answeredPlayers >= totalPlayers) {
            await handleRoundEnd();
          }
        }
      } else {
        await chatService.sendMessage(roomCode, user.id, user.nickname, answer);
      }
    } catch (err) {
      console.error('정답 제출 실패:', err);
    }
  };

  const handleRoundEnd = async () => {
    if (!gameState || !currentRound) return;

    try {
      await endRound();
      await chatService.sendSystemMessage(
        roomCode,
        `라운드가 종료되었습니다! 정답은 "${currentRound.word}"였습니다.`
      );

      // 3초 대기 (결과 확인 시간)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 마지막 라운드인 경우 게임 종료
      if (gameState.currentRound >= gameState.totalRounds) {
        await gameService.endGame(roomCode);
        await chatService.sendSystemMessage(roomCode, '게임이 종료되었습니다!');

        // 최종 결과 페이지로 이동하기 전 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/room/${roomCode}/finished`);
      } else {
        // 다음 라운드로 진행
        await chatService.sendSystemMessage(
          roomCode,
          `잠시 후 라운드 ${gameState.currentRound + 1}이(가) 시작됩니다.`
        );
        await gameService.startNextRound(roomCode, gameState.currentRound + 1);
      }
    } catch (err) {
      console.error('라운드 종료 실패:', err);
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

        <GamePlayingRoom
          roomCode={roomCode}
          gameState={gameState}
          currentRound={currentRound}
          players={players}
          userId={user.id}
          nickname={user.nickname}
          isDrawer={isDrawer}
          onAnswerSubmit={handleAnswerSubmit}
        />
      </div>

      <WordChoiceModal
        isOpen={showWordChoice}
        choices={wordChoices}
        onSelect={handleWordSelect}
      />
    </main>
  );
}
