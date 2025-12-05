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
            userId={userId}
            nickname={nickname}
            isDrawer={isDrawer}
            onAnswerSubmit={onAnswerSubmit}
          />
        </div>
      </div>
    </div>
  );
}
