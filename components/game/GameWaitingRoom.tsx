/**
 * GameWaitingRoom Component
 * 게임 대기실 - 게임 시작 전 대기 상태
 */

'use client';

import { Player } from '@/types';
import { PlayerList } from './PlayerList';
import { Button } from '../shared/Button';

interface GameWaitingRoomProps {
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

export function GameWaitingRoom({
  players,
  isHost,
  onStartGame,
}: GameWaitingRoomProps) {
  const canStartGame = players.length >= 2;

  return (
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
              onClick={onStartGame}
              size="lg"
              disabled={!canStartGame}
            >
              게임 시작
            </Button>
          )}
          {!canStartGame && (
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
  );
}
