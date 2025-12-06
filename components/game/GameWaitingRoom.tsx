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
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4">
      {/* 게임 시작 영역 */}
      <div className="lg:col-span-2 order-1 lg:order-1">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            게임 대기 중...
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8">
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
            <p className="text-xs sm:text-sm text-red-600 mt-3 sm:mt-4">
              최소 2명 이상의 플레이어가 필요합니다
            </p>
          )}
        </div>
      </div>
      {/* 플레이어 목록 */}
      <div className="order-2 lg:order-2">
        <PlayerList players={players} />
      </div>
    </div>
  );
}
