/**
 * Home Page (Lobby)
 * 로비 페이지 - 닉네임 입력 및 방 생성/참가
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { roomService } from '@/lib/domains/room/services/roomService';
import { NicknameInput } from '@/components/lobby/NicknameInput';
import { CreateRoomForm } from '@/components/lobby/CreateRoomForm';
import { JoinRoomForm } from '@/components/lobby/JoinRoomForm';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Loading } from '@/components/shared/Loading';
import { RoomSettings } from '@/types';

export default function Home() {
  const router = useRouter();
  const { user, loading: userLoading, createUser, logout } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // 닉네임 제출
  const handleNicknameSubmit = async (nickname: string) => {
    setError('');
    try {
      await createUser(nickname);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 방 생성
  const handleCreateRoom = async (title: string, settings: RoomSettings) => {
    if (!user) return;

    setActionLoading(true);
    setError('');

    try {
      const room = await roomService.createRoom({
        title,
        hostUserId: user.id,
        settings,
      });

      // 방으로 이동
      router.push(`/room/${room.code}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // 방 참가
  const handleJoinRoom = async (roomCode: string) => {
    if (!user) return;

    setActionLoading(true);
    setError('');

    try {
      await roomService.joinRoom(user.id, roomCode);

      // 방으로 이동
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError((err as Error).message);
      setActionLoading(false);
    }
  };

  if (userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로딩 중..." />
      </main>
    );
  }

  // 닉네임 미입력 시
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Catchmind</h1>
          <p className="text-xl text-gray-600">실시간 그림 맞추기 게임</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            닉네임을 입력하세요
          </h2>
          <NicknameInput onSubmit={handleNicknameSubmit} />
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </main>
    );
  }

  // 로비 화면
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Catchmind</h1>
        <p className="text-xl text-gray-600 mb-2">안녕하세요, {user.nickname}님!</p>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          로그아웃
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="space-y-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full"
            size="lg"
          >
            방 만들기
          </Button>

          <Button
            onClick={() => setShowJoinModal(true)}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            방 참가하기
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* 방 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="방 만들기"
      >
        <CreateRoomForm
          onCreateRoom={handleCreateRoom}
          loading={actionLoading}
        />
      </Modal>

      {/* 방 참가 모달 */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="방 참가하기"
      >
        <JoinRoomForm
          onJoinRoom={handleJoinRoom}
          loading={actionLoading}
        />
      </Modal>
    </main>
  );
}
