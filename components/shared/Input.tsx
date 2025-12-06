/**
 * Input Component
 * 공통 입력 컴포넌트
 */

import React from 'react';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email';
  className?: string;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  disabled = false,
  type = 'text',
  className = '',
}: InputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`
          px-3 py-2 sm:px-4 text-sm sm:text-base border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
      {maxLength && (
        <p className="mt-1 text-[10px] sm:text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
