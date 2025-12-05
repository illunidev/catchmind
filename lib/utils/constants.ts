/**
 * Constants
 * 프로젝트 전역 상수
 */

// 게임 설정
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  ROUND_TIME: 60, // 초
  WORD_CHOICE_TIME: 30, // 초
  ROUND_END_DELAY: 3000, // ms
  ROOM_CODE_LENGTH: 8,
} as const;

// 유저 설정
export const USER_CONSTANTS = {
  MAX_NICKNAME_LENGTH: 20,
  MIN_NICKNAME_LENGTH: 1,
} as const;

// 점수 설정
export const SCORE_CONSTANTS = {
  FIRST: 10,
  SECOND: 7,
  THIRD: 5,
  DEFAULT: 3,
  DRAWER_BASE: 5,
  DRAWER_ALL_CORRECT: 3,
  TIME_BONUS_DIVISOR: 6,
} as const;

// 캔버스 설정
export const CANVAS_CONSTANTS = {
  THROTTLE_MS: 50,
  MIN_BRUSH_SIZE: 1,
  MAX_BRUSH_SIZE: 20,
  DEFAULT_BRUSH_SIZE: 4,
  DEFAULT_COLOR: '#000000',
} as const;

// 채팅 설정
export const CHAT_CONSTANTS = {
  MAX_MESSAGES: 50,
  MAX_MESSAGE_LENGTH: 200,
} as const;

// 방 코드 생성용 문자
export const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// 기본 아바타 URL (선택)
export const DEFAULT_AVATAR_URLS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
] as const;
