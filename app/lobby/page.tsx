/**
 * Lobby Page
 * 로비 페이지 - 방 생성/참가
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { useRoomList } from '@/lib/domains/room/hooks/useRoomList';
import { useRoomCleanup } from '@/lib/domains/room/hooks/useRoomCleanup';
import { roomService } from '@/lib/domains/room/services/roomService';
import { CreateRoomForm } from '@/components/lobby/CreateRoomForm';
import { JoinRoomForm } from '@/components/lobby/JoinRoomForm';
import { RoomList } from '@/components/lobby/RoomList';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Loading } from '@/components/shared/Loading';
import { RoomSettings } from '@/types';

export default function LobbyPage() {
  const router = useRouter();
  const { user, loading: userLoading, logout } = useUser();
  const { rooms, loading: roomsLoading } = useRoomList();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // 방 자동 정리 (1분마다 체크, 5분 이상 지난 finished 방 삭제)
  useRoomCleanup();

  // 로그인 안 된 상태면 홈으로 리다이렉트
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // localStorage 정리 (이미 방에서 나온 상태)
  useEffect(() => {
    if (!user) return;

    // 로비에 왔다는 것은 이미 방을 나갔다는 의미이므로 localStorage만 정리
    localStorage.removeItem('currentRoomId');
    localStorage.removeItem('currentRoomCode');
  }, [user]);

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

  // 로그인 안 된 경우 (리다이렉트 중)
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로그인 페이지로 이동 중..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 방 만들기/참가 버튼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">시작하기</h2>
              <div className="space-y-3">
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
                  코드로 참가
                </Button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>
          </div>

          {/* 오른쪽: 방 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">방 목록</h2>
                <span className="text-sm text-gray-500">
                  {rooms.length}개의 방
                </span>
              </div>

              {roomsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading text="방 목록 불러오는 중..." />
                </div>
              ) : (
                <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
              )}
            </div>
          </div>
        </div>
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
