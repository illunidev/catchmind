/**
 * Validation Functions
 * 검증 함수들
 */

import { USER_CONSTANTS, GAME_CONSTANTS } from './constants';

/**
 * 닉네임 유효성 검사
 */
export const validateNickname = (nickname: string): boolean => {
  const trimmed = nickname.trim();
  return (
    trimmed.length >= USER_CONSTANTS.MIN_NICKNAME_LENGTH &&
    trimmed.length <= USER_CONSTANTS.MAX_NICKNAME_LENGTH
  );
};

/**
 * 방 코드 유효성 검사
 */
export const validateRoomCode = (code: string): boolean => {
  const pattern = new RegExp(
    `^[A-Z0-9]{${GAME_CONSTANTS.ROOM_CODE_LENGTH}}$`
  );
  return pattern.test(code);
};

/**
 * 방 제목 유효성 검사
 */
export const validateRoomTitle = (title: string): boolean => {
  const trimmed = title.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
};

/**
 * 플레이어 수 유효성 검사
 */
export const validatePlayerCount = (count: number): boolean => {
  return (
    count >= GAME_CONSTANTS.MIN_PLAYERS &&
    count <= GAME_CONSTANTS.MAX_PLAYERS
  );
};

/**
 * 이메일 형식 검사 (선택)
 */
export const validateEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};
