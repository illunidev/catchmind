/**
 * NicknameInput Component
 * 닉네임 입력 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { USER_CONSTANTS } from '@/lib/utils/constants';
import { validateNickname } from '@/lib/utils/validation';

interface NicknameInputProps {
  onSubmit: (nickname: string) => void;
  loading?: boolean;
}

export function NicknameInput({ onSubmit, loading = false }: NicknameInputProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!validateNickname(nickname)) {
      setError(`닉네임은 ${USER_CONSTANTS.MIN_NICKNAME_LENGTH}-${USER_CONSTANTS.MAX_NICKNAME_LENGTH}자 사이여야 합니다.`);
      return;
    }

    onSubmit(nickname.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="space-y-4">
        <Input
          label="닉네임"
          value={nickname}
          onChange={setNickname}
          placeholder="닉네임을 입력하세요"
          maxLength={USER_CONSTANTS.MAX_NICKNAME_LENGTH}
          error={error}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !nickname.trim()}
          className="w-full"
        >
          {loading ? '처리 중...' : '시작하기'}
        </Button>
      </div>
    </form>
  );
}
