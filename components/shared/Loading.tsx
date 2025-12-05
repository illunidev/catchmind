/**
 * Loading Component
 * 로딩 스피너 컴포넌트
 */

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ size = 'md', text }: LoadingProps) {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeStyles[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}
