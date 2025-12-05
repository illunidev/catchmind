/**
 * useUser Hook
 * 현재 유저 상태 관리
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { userService } from '../services/userService';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  createUser: (nickname: string) => Promise<void>;
  logout: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 초기 로드: 로컬 스토리지에서 유저 복원
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = userService.loadFromLocalStorage();
        if (stored) {
          // Firebase에서 최신 정보 확인
          const latest = await userService.getUserById(stored.id);
          if (latest) {
            setUser(latest);
            userService.saveToLocalStorage(latest);
          } else {
            // Firebase에 없으면 로컬 스토리지도 삭제
            userService.clearLocalStorage();
            setUser(null);
          }
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 유저 생성
  const createUser = useCallback(async (nickname: string) => {
    setLoading(true);
    setError(null);

    try {
      const newUser = await userService.createGuestUser(nickname);
      setUser(newUser);
      userService.saveToLocalStorage(newUser);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    setUser(null);
    userService.clearLocalStorage();
  }, []);

  return {
    user,
    loading,
    error,
    createUser,
    logout,
  };
}
