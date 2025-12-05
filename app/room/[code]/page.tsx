/**
 * Room Page
 * 게임 방 페이지 - 대기실 및 게임 진행
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoom } from '@/lib/domains/room/hooks/useRoom';
import { useGame } from '@/lib/domains/game/hooks/useGame';
import { useAnswerCheck } from '@/lib/domains/answer/hooks/useAnswerCheck';
import { roomService } from '@/lib/domains/room/services/roomService';
import { gameService } from '@/lib/domains/game/services/gameService';
import { chatService } from '@/lib/domains/chat/services/chatService';
import { wordService } from '@/lib/domains/word/services/wordService';
import { RoomHeader } from '@/components/game/RoomHeader';
import { PlayerList } from '@/components/game/PlayerList';
import { GameInfo } from '@/components/game/GameInfo';
import { Canvas } from '@/components/game/Canvas';
import { ChatBox } from '@/components/game/ChatBox';
import { WordChoiceModal } from '@/components/game/WordChoiceModal';
import { Button } from '@/components/shared/Button';
import { Loading } from '@/components/shared/Loading';
import { WordChoice } from '@/types/word';

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>('');
  const { user, loading: userLoading } = useUser();
  const { room, players, loading: roomLoading } = useRoom(roomCode);
  const { gameState, currentRound, startGame, startRound, submitAnswer, endRound } = useGame(roomCode);
  const { checkAnswer } = useAnswerCheck();

  const [showWordChoice, setShowWordChoice] = useState(false);
  const [wordChoices, setWordChoices] = useState<WordChoice[]>([]);
  const [error, setError] = useState('');

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

  // 방 유효성 체크 (roomCode가 있고, 로딩이 끝났는데도 room이 없으면)
  useEffect(() => {
    // roomCode가 설정되지 않았으면 체크하지 않음
    if (!roomCode) return;

    // 아직 로딩 중이면 체크하지 않음
    if (roomLoading) return;

    // 로딩 완료 후 방이 없으면 에러
    if (!room) {
      alert('존재하지 않는 방입니다.');
      router.push('/');
    }
  }, [room, roomLoading, roomCode, router]);

  if (userLoading || roomLoading || !user || !room || !roomCode) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로딩 중..." />
      </main>
    );
  }

  const currentPlayer = players.find((p) => p.userId === user.id);
  const isHost = currentPlayer?.isHost || false;
  const isDrawer = currentRound?.drawerId === user.id;

  /**
   * 게임 시작
   */
  const handleStartGame = async () => {
    if (!isHost || gameState) return;

    try {
      setError('');
      await startGame(players);
      await chatService.sendSystemMessage(roomCode, '게임이 시작됩니다!');

      // 첫 라운드 시작
      await handleStartNewRound(1);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /**
   * 새 라운드 시작
   */
  const handleStartNewRound = async (roundNumber: number) => {
    if (!gameState) return;

    const drawerIndex = (roundNumber - 1) % gameState.drawOrder.length;
    const drawerId = gameState.drawOrder[drawerIndex];

    // 단어 선택지 생성
    const choices = wordService.getWordChoices(room.settings);
    setWordChoices(choices);

    // 출제자에게만 모달 표시
    if (drawerId === user.id) {
      setShowWordChoice(true);
    } else {
      await chatService.sendSystemMessage(
        roomCode,
        `${players.find((p) => p.userId === drawerId)?.nickname}님이 단어를 선택하고 있습니다...`
      );
    }
  };

  /**
   * 단어 선택 완료
   */
  const handleWordSelect = async (word: string, category: string) => {
    if (!gameState) return;

    setShowWordChoice(false);

    try {
      await startRound(gameState.currentRound + 1, user.id, word, category);
      await chatService.sendSystemMessage(roomCode, '라운드가 시작되었습니다!');

      // 타이머 시작 - 시간 종료 시 자동으로 라운드 종료
      setTimeout(async () => {
        await handleRoundEnd();
      }, currentRound?.timeLimit ? currentRound.timeLimit * 1000 : 80000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /**
   * 정답 제출
   */
  const handleAnswerSubmit = async (answer: string) => {
    if (!currentRound || isDrawer) return;

    try {
      // 로컬 검증
      const result = checkAnswer(answer, currentRound.word);

      if (result.isCorrect) {
        // 정답
        const isCorrect = await submitAnswer(user.id, answer, currentRound.word);

        if (isCorrect) {
          await chatService.sendAnswerMessage(roomCode, user.id, user.nickname, answer);
          await chatService.sendSystemMessage(
            roomCode,
            `${user.nickname}님이 정답을 맞췄습니다!`
          );

          // 모든 플레이어가 정답을 맞췄는지 체크
          const answeredPlayers = Object.keys(currentRound.answers || {}).length + 1;
          const totalPlayers = players.length - 1; // 출제자 제외

          if (answeredPlayers >= totalPlayers) {
            await handleRoundEnd();
          }
        }
      } else {
        // 오답 - 일반 채팅으로 전송
        await chatService.sendMessage(roomCode, user.id, user.nickname, answer);
      }
    } catch (err) {
      console.error('정답 제출 실패:', err);
    }
  };

  /**
   * 라운드 종료
   */
  const handleRoundEnd = async () => {
    if (!gameState || !currentRound) return;

    try {
      await endRound();
      await chatService.sendSystemMessage(
        roomCode,
        `라운드가 종료되었습니다! 정답은 "${currentRound.word}"였습니다.`
      );

      // 다음 라운드 또는 게임 종료
      if (gameState.currentRound >= gameState.totalRounds) {
        await handleGameEnd();
      } else {
        setTimeout(() => {
          handleStartNewRound(gameState.currentRound + 1);
        }, 3000);
      }
    } catch (err) {
      console.error('라운드 종료 실패:', err);
    }
  };

  /**
   * 게임 종료
   */
  const handleGameEnd = async () => {
    try {
      await gameService.endGame(roomCode);
      await chatService.sendSystemMessage(roomCode, '게임이 종료되었습니다!');
    } catch (err) {
      console.error('게임 종료 실패:', err);
    }
  };

  /**
   * 방 나가기
   */
  const handleLeaveRoom = async () => {
    try {
      await roomService.leaveRoom(user.id, roomCode);
      await chatService.sendSystemMessage(roomCode, `${user.nickname}님이 방을 나갔습니다.`);
    } catch (err) {
      console.error('방 나가기 실패:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 방 헤더 */}
        <RoomHeader room={room} onLeave={handleLeaveRoom} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 대기실 */}
        {!gameState && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  게임 대기 중...
                </h2>
                <p className="text-gray-600 mb-8">
                  호스트가 게임을 시작할 때까지 기다려주세요
                </p>
                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    disabled={players.length < 2}
                  >
                    게임 시작
                  </Button>
                )}
                {players.length < 2 && (
                  <p className="text-sm text-red-600 mt-4">
                    최소 2명 이상의 플레이어가 필요합니다
                  </p>
                )}
              </div>
            </div>
            <div>
              <PlayerList players={players} />
            </div>
          </div>
        )}

        {/* 게임 진행 중 */}
        {gameState && gameState.status !== 'finished' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 왼쪽: 플레이어 목록 */}
            <div className="lg:col-span-1">
              <PlayerList players={players} currentDrawerId={currentRound?.drawerId} />
            </div>

            {/* 가운데: 캔버스 */}
            <div className="lg:col-span-2 space-y-4">
              <GameInfo
                gameState={gameState}
                currentRound={currentRound}
                isDrawer={isDrawer}
              />
              {gameState.status === 'drawing' && (
                <Canvas roomCode={roomCode} isDrawer={isDrawer} />
              )}
            </div>

            {/* 오른쪽: 채팅 */}
            <div className="lg:col-span-1">
              <div className="h-[700px]">
                <ChatBox
                  roomCode={roomCode}
                  userId={user.id}
                  nickname={user.nickname}
                  isDrawer={isDrawer}
                  onAnswerSubmit={handleAnswerSubmit}
                />
              </div>
            </div>
          </div>
        )}

        {/* 게임 종료 */}
        {gameState?.status === 'finished' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              게임 종료!
            </h2>
            <div className="mb-8">
              <PlayerList players={players} />
            </div>
            {isHost && (
              <Button onClick={() => router.push('/')} size="lg">
                로비로 돌아가기
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 단어 선택 모달 */}
      <WordChoiceModal
        isOpen={showWordChoice}
        choices={wordChoices}
        onSelect={handleWordSelect}
      />
    </main>
  );
}
