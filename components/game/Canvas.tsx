/**
 * Canvas Component
 * 그림 그리기 캔버스 컴포넌트
 */

'use client';

import React, { useEffect } from 'react';
import { useCanvas } from '@/lib/domains/canvas/hooks/useCanvas';

interface CanvasProps {
  roomCode: string;
  isDrawer: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function Canvas({ roomCode, isDrawer }: CanvasProps) {
  const {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
  } = useCanvas({ roomCode, isDrawer });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    if (!isDrawer) return;
    stopDrawing();
  };

  const handleMouseLeave = () => {
    if (!isDrawer) return;
    stopDrawing();
  };

  // 터치 이벤트 처리 (모바일)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = () => {
    if (!isDrawer) return;
    stopDrawing();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 툴바 */}
      {isDrawer && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
          {/* 도구 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`px-4 py-2 rounded ${
                tool === 'pen'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              펜
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-4 py-2 rounded ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              지우개
            </button>
          </div>

          {/* 색상 선택 */}
          {tool === 'pen' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">색상:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 cursor-pointer rounded border border-gray-300"
              />
              {/* 기본 색상 팔레트 */}
              <div className="flex gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 선 두께 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">두께:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-700 w-8">{lineWidth}</span>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={undo}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              실행 취소
            </button>
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              전체 지우기
            </button>
          </div>
        </div>
      )}

      {/* 캔버스 */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`border-4 border-gray-300 rounded-lg bg-white ${
            isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
          style={{ touchAction: 'none' }}
        />
        {!isDrawer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-gray-400 bg-white bg-opacity-80 px-4 py-2 rounded">
              그림을 보고 맞춰보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
