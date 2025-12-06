/**
 * ChatBox Component
 * 채팅 및 정답 입력 컴포넌트
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/domains/chat/hooks/useChat';
import { ChatMessage } from '@/types/chat';

interface ChatBoxProps {
  roomCode: string;
  userId: string;
  nickname: string;
  isDrawer: boolean;
  onAnswerSubmit?: (answer: string) => void;
}

export function ChatBox({
  roomCode,
  userId,
  nickname,
  isDrawer,
  onAnswerSubmit,
}: ChatBoxProps) {
  const { messages, sendMessage } = useChat({ roomCode, userId, nickname });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmedInput = input.trim();

    // 그리는 사람은 채팅만 가능
    if (isDrawer) {
      await sendMessage(trimmedInput);
      setInput('');
      return;
    }

    // 그리지 않는 사람은 정답 체크
    if (onAnswerSubmit) {
      await onAnswerSubmit(trimmedInput);
      setInput('');
    } else {
      await sendMessage(trimmedInput);
      setInput('');
    }
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'system':
        return 'text-gray-500 italic text-center text-sm';
      case 'answer':
        return 'text-green-600 font-bold';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* 채팅 헤더 */}
      <div className="p-2 sm:p-4 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">채팅</h3>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1.5 sm:space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${getMessageStyle(message)} ${
              message.type === 'system' ? 'w-full' : ''
            }`}
          >
            {message.type === 'system' ? (
              <p>{message.content}</p>
            ) : (
              <div className="flex items-start">
                <span className="font-semibold mr-2">{message.nickname}:</span>
                <span>{message.content}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 폼 */}
      <div className="p-2 sm:p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-1.5 sm:gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isDrawer
                ? '채팅을 입력하세요...'
                : '정답을 입력하세요...'
            }
            className="flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!roomCode}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
