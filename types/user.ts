/**
 * User Domain Types
 * 유저 관련 타입 정의
 */

export interface User {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: number;
  lastActive?: number;
}

export interface CreateUserInput {
  nickname: string;
  avatarUrl?: string;
}
