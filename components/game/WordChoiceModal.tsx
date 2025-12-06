/**
 * WordChoiceModal Component
 * 출제자가 단어를 선택하는 모달
 */

'use client';

import React, { useState, useEffect } from 'react';
import { WordChoice } from '@/types/word';
import { Modal } from '@/components/shared/Modal';

interface WordChoiceModalProps {
  isOpen: boolean;
  choices: WordChoice[];
  onSelect: (word: string) => void;
  timeLimit?: number; // 선택 제한 시간 (초)
}

export function WordChoiceModal({
  isOpen,
  choices,
  onSelect,
  timeLimit = 10,
}: WordChoiceModalProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(timeLimit);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // 시간 초과 시 첫 번째 단어 자동 선택
          if (choices.length > 0) {
            setTimeout(() => {
              onSelect(choices[0].text);
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, choices, onSelect, timeLimit]);

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      food: '음식',
      animal: '동물',
      object: '사물',
      action: '행동',
    };
    return categoryNames[category] || category;
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="단어를 선택하세요">
      <div className="space-y-6">
        {/* 타이머 */}
        <div className="text-center">
          <div className="inline-block bg-blue-100 rounded-full px-6 py-3">
            <span className="text-3xl font-bold text-blue-600">{timeLeft}</span>
            <span className="text-sm text-blue-600 ml-2">초</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            시간 내에 선택하지 않으면 자동으로 선택됩니다
          </p>
        </div>

        {/* 단어 선택지 */}
        <div className="grid grid-cols-1 gap-4">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              onClick={() => onSelect(choice.text)}
              className="group relative p-6 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {choice.text}
                </p>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-lg pointer-events-none"></div>
            </button>
          ))}
        </div>

        {/* 키보드 단축키 안내 */}
        <div className="text-center text-xs text-gray-400">
          <p>단축키: 1, 2, 3 키로 빠르게 선택할 수 있습니다</p>
        </div>
      </div>
    </Modal>
  );
}
