/**
 * User Service
 * 유저 생성 및 관리 서비스
 */

import { User, CreateUserInput } from '@/types';
import { setData, getData, updateData } from '@/lib/firebase/database';
import { validateNickname } from '@/lib/utils/validation';
import { generateId, sanitizeNickname } from '@/lib/utils/helpers';

class UserService {
  /**
   * 게스트 유저 생성
   */
  async createGuestUser(nickname: string): Promise<User> {
    // 닉네임 검증
    const sanitized = sanitizeNickname(nickname);
    if (!validateNickname(sanitized)) {
      throw new Error('닉네임은 1-20자 사이여야 합니다.');
    }

    // 유저 생성
    const userId = generateId();
    const user: User = {
      id: userId,
      nickname: sanitized,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    // Firebase에 저장
    await setData(`users/${userId}`, user);

    return user;
  }

  /**
   * 유저 ID로 조회
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await getData<User>(`users/${userId}`);
    return user;
  }

  /**
   * 유저 프로필 업데이트
   */
  async updateProfile(
    userId: string,
    data: Partial<User>
  ): Promise<void> {
    // 닉네임 업데이트 시 검증
    if (data.nickname) {
      const sanitized = sanitizeNickname(data.nickname);
      if (!validateNickname(sanitized)) {
        throw new Error('닉네임은 1-20자 사이여야 합니다.');
      }
      data.nickname = sanitized;
    }

    // lastActive 업데이트
    data.lastActive = Date.now();

    await updateData(`users/${userId}`, data);
  }

  /**
   * 유저를 로컬 스토리지에 저장
   */
  saveToLocalStorage(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('catchmind_user', JSON.stringify(user));
    }
  }

  /**
   * 로컬 스토리지에서 유저 불러오기
   */
  loadFromLocalStorage(): User | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('catchmind_user');
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * 로컬 스토리지에서 유저 삭제
   */
  clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('catchmind_user');
    }
  }
}

// Singleton 인스턴스
export const userService = new UserService();
