/**
 * Chat Domain Types
 * 채팅 관련 타입 정의
 */

export type MessageType = 'user' | 'system' | 'answer';

export interface ChatMessage {
  id: string;
  userId: string | null;
  nickname?: string; // 발신자 닉네임 (system 메시지는 null)
  type: MessageType;
  content: string;
  originalContent?: string; // type='answer'일 때 실제 답
  timestamp: number;
}

export interface SendMessageInput {
  roomId: string;
  userId: string;
  content: string;
}
