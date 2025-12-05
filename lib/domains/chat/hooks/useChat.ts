/**
 * useChat Hook
 * 채팅 메시지 실시간 구독 및 전송 훅
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { listenToChildAdded } from '@/lib/firebase/database';
import { chatService } from '../services/chatService';

interface UseChatOptions {
  roomCode: string;
  userId: string;
  nickname: string;
}

export function useChat({ roomCode, userId, nickname }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 메시지 로드 및 실시간 리스너 설정
  useEffect(() => {
    if (!roomCode) return;

    // 초기 메시지 로드
    chatService.getMessages(roomCode, 50).then((initialMessages) => {
      setMessages(initialMessages);
      setLoading(false);
    });

    // 새 메시지 리스너
    const unsubscribe = listenToChildAdded(
      `chats/${roomCode}`,
      (snapshot) => {
        const message = snapshot.val() as ChatMessage | null;
        if (message) {
          setMessages((prev) => {
            // 중복 방지
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        }
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  /**
   * 채팅 메시지 전송
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      await chatService.sendMessage(roomCode, userId, nickname, content.trim());
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }, [roomCode, userId, nickname]);

  /**
   * 시스템 메시지 전송
   */
  const sendSystemMessage = useCallback(async (content: string) => {
    try {
      await chatService.sendSystemMessage(roomCode, content);
    } catch (error) {
      console.error('시스템 메시지 전송 실패:', error);
      throw error;
    }
  }, [roomCode]);

  /**
   * 정답 메시지 전송
   */
  const sendAnswerMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      await chatService.sendAnswerMessage(roomCode, userId, nickname, content.trim());
    } catch (error) {
      console.error('정답 메시지 전송 실패:', error);
      throw error;
    }
  }, [roomCode, userId, nickname]);

  return {
    messages,
    loading,
    sendMessage,
    sendSystemMessage,
    sendAnswerMessage,
  };
}
