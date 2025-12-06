/**
 * GameFinishedRoom Component
 * 게임 종료 화면 - 최종 결과 및 순위
 */

'use client';

import { Player } from '@/types';
import { PlayerList } from './PlayerList';
import { Button } from '../shared/Button';

interface GameFinishedRoomProps {
  players: Player[];
  isHost: boolean;
  currentUserId?: string;
  onBackToLobby: () => void;
}

export function GameFinishedRoom({
  players,
  isHost,
  currentUserId,
  onBackToLobby,
}: GameFinishedRoomProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
      <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
        게임 종료!
      </h2>
      <div className="mb-4 sm:mb-8">
        <PlayerList players={players} currentUserId={currentUserId} />
      </div>
      {isHost && (
        <Button onClick={onBackToLobby} size="lg">
          로비로 돌아가기
        </Button>
      )}
    </div>
  );
}
