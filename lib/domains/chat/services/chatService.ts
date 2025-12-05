/**
 * Chat Service
 * 채팅 메시지 관리 서비스
 */

import { ChatMessage, MessageType } from '@/types/chat';
import { pushData, getData } from '@/lib/firebase/database';
import { generateId } from '@/lib/utils/helpers';

export class ChatService {
  /**
   * 메시지 전송
   */
  async sendMessage(
    roomCode: string,
    userId: string,
    nickname: string,
    content: string,
    type: MessageType = 'chat'
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: generateId(),
      userId,
      nickname,
      content,
      type,
      timestamp: Date.now(),
    };

    await pushData(`chats/${roomCode}`, message);

    return message;
  }

  /**
   * 시스템 메시지 전송
   */
  async sendSystemMessage(
    roomCode: string,
    content: string
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: generateId(),
      userId: 'system',
      nickname: 'System',
      content,
      type: 'system',
      timestamp: Date.now(),
    };

    await pushData(`chats/${roomCode}`, message);

    return message;
  }

  /**
   * 정답 메시지 전송
   */
  async sendAnswerMessage(
    roomCode: string,
    userId: string,
    nickname: string,
    content: string
  ): Promise<ChatMessage> {
    return await this.sendMessage(roomCode, userId, nickname, content, 'answer');
  }

  /**
   * 메시지 목록 가져오기
   */
  async getMessages(roomCode: string, limit?: number): Promise<ChatMessage[]> {
    const messages = await getData<Record<string, ChatMessage>>(`chats/${roomCode}`);

    if (!messages) return [];

    const messageArray = Object.values(messages)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (limit) {
      return messageArray.slice(-limit);
    }

    return messageArray;
  }
}

// Singleton instance
export const chatService = new ChatService();
