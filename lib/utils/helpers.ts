/**
 * Helper Functions
 * 유틸리티 헬퍼 함수들
 */

import { GAME_CONSTANTS, ROOM_CODE_CHARS } from './constants';

/**
 * 방 코드 생성 (예: KF652739)
 */
export const generateRoomCode = (): string => {
  let code = '';
  for (let i = 0; i < GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS.charAt(
      Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    );
  }
  return code;
};

/**
 * 총 라운드 수 계산
 */
export const calculateTotalRounds = (playerCount: number): number => {
  if (playerCount <= 3) {
    return playerCount * 2;
  }
  return playerCount;
};

/**
 * 배열 셔플
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 랜덤 선택
 */
export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 랜덤 N개 선택
 */
export const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * 딜레이 (Promise)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 고유 ID 생성 (간단한 버전)
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 닉네임에서 특수문자 제거
 */
export const sanitizeNickname = (nickname: string): string => {
  return nickname.trim().replace(/[^\w가-힣\s]/g, '');
};

/**
 * 날짜 포맷팅 (간단한 버전)
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR');
};
