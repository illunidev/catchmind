/**
 * Home Page (Login)
 * 로그인 페이지 - 닉네임 입력
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/domains/user/hooks/useUser';
import { NicknameInput } from '@/components/lobby/NicknameInput';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const router = useRouter();
  const { user, loading: userLoading, createUser } = useUser();
  const [error, setError] = useState('');

  // 로그인된 상태면 로비로 리다이렉트
  useEffect(() => {
    if (!userLoading && user) {
      router.push('/lobby');
    }
  }, [user, userLoading, router]);

  // 닉네임 제출
  const handleNicknameSubmit = async (nickname: string) => {
    setError('');
    try {
      await createUser(nickname);
      // createUser 성공 시 useEffect에서 자동으로 /lobby로 이동
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로딩 중..." />
      </main>
    );
  }

  // 이미 로그인된 경우 (리다이렉트 중)
  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading text="로비로 이동 중..." />
      </main>
    );
  }

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
