/**
 * GamePlayingRoom Component
 * 게임 진행 중 화면 - 캔버스, 채팅, 플레이어 목록
 */

'use client';

import { Player, GameState, Round } from '@/types';
import { PlayerList } from './PlayerList';
import { GameInfo } from './GameInfo';
import { Canvas } from './Canvas';
import { ChatBox } from './ChatBox';

interface GamePlayingRoomProps {
  roomCode: string;
  gameState: GameState;
  currentRound: Round | null;
  players: Player[];
  userId: string;
  nickname: string;
  isDrawer: boolean;
  onAnswerSubmit: (answer: string) => void;
}

export function GamePlayingRoom({
  roomCode,
  gameState,
  currentRound,
  players,
  userId,
  nickname,
  isDrawer,
  onAnswerSubmit,
}: GamePlayingRoomProps) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-2 sm:gap-4">
      {/* 게임 정보 - 모바일에서 최상단 */}
      <div className="lg:col-span-2 lg:order-2">
        <GameInfo
          gameState={gameState}
          currentRound={currentRound}
          isDrawer={isDrawer}
        />
      </div>

      {/* 캔버스 - 모바일에서 두번째 */}
      <div className="lg:col-span-2 lg:order-2">
        {gameState.status === 'drawing' && (
          <Canvas roomCode={roomCode} isDrawer={isDrawer} />
        )}
      </div>

      {/* 채팅 - 모바일에서 세번째 */}
      <div className="lg:col-span-1 lg:order-3">
        <div className="h-[300px] sm:h-[400px] lg:h-[600px]">
          <ChatBox
            roomCode={roomCode}
            userId={userId}
            nickname={nickname}
            isDrawer={isDrawer}
            onAnswerSubmit={onAnswerSubmit}
          />
        </div>
      </div>

      {/* 플레이어 목록 - 모바일에서 최하단, 데스크톱에서 왼쪽 */}
      <div className="lg:col-span-1 lg:order-1">
        <PlayerList players={players} currentDrawerId={currentRound?.drawerId} />
      </div>
    </div>
  );
}
