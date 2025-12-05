/**
 * Room Domain Types
 * 방 관련 타입 정의
 */

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export type Category = 'all' | 'food' | 'animal' | 'object' | 'action';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface RoomSettings {
  maxPlayers: number;
  category: Category;
  difficulty: Difficulty;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  hostUserId: string;
  currentPlayers: number;
  maxPlayers: number;
  status: RoomStatus;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
}

export type PlayerStatus = 'idle' | 'choosing' | 'drawing' | 'guessing' | 'answered';

export interface Player {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  score: number;
  status: PlayerStatus;
  lastChat?: string;
  isHost: boolean;
  joinedAt: number;
  isOnline: boolean;
  lastSeen: number;
}

export interface CreateRoomInput {
  title: string;
  hostUserId: string;
  settings: RoomSettings;
}

export interface UpdateRoomSettingsInput {
  maxPlayers?: number;
  category?: Category;
  difficulty?: Difficulty;
}
