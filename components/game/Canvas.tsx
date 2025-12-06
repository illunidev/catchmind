/**
 * Canvas Component
 * 그림 그리기 캔버스 컴포넌트
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCanvas } from '@/lib/domains/canvas/hooks/useCanvas';

interface CanvasProps {
  roomCode: string;
  isDrawer: boolean;
}

// 캔버스 내부 해상도 (고정, 비율 4:3)
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

  // 반응형 캔버스 크기
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      // 컨테이너 너비에 맞게 스케일 조정 (최대 1)
      const scale = Math.min(containerWidth / CANVAS_WIDTH, 1);
      setCanvasScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    // 스케일 반영하여 실제 캔버스 좌표 계산
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    startDrawing(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    draw(x, y);
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
    const x = (touch.clientX - rect.left) / canvasScale;
    const y = (touch.clientY - rect.top) / canvasScale;
    startDrawing(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / canvasScale;
    const y = (touch.clientY - rect.top) / canvasScale;
    draw(x, y);
  };

  const handleTouchEnd = () => {
    if (!isDrawer) return;
    stopDrawing();
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-2 sm:space-y-4 w-full">
      {/* 툴바 */}
      {isDrawer && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-white p-2 sm:p-4 rounded-lg shadow-md w-full">
          {/* 도구 선택 */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${
                tool === 'pen'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              펜
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${
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
            <div className="flex items-center gap-1 sm:gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer rounded border border-gray-300"
              />
              {/* 기본 색상 팔레트 */}
              <div className="flex gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-gray-300"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 선 두께 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 sm:w-24"
            />
            <span className="text-xs sm:text-sm text-gray-700 w-6">{lineWidth}</span>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={undo}
              className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              취소
            </button>
            <button
              onClick={clearCanvas}
              className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              전체삭제
            </button>
          </div>
        </div>
      )}

      {/* 캔버스 */}
      <div className="relative w-full flex justify-center">
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
          className={`border-2 sm:border-4 border-gray-300 rounded-lg bg-white ${
            isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
          style={{
            touchAction: 'none',
            width: CANVAS_WIDTH * canvasScale,
            height: CANVAS_HEIGHT * canvasScale,
          }}
        />
        {!isDrawer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-base sm:text-2xl font-bold text-gray-400 bg-white bg-opacity-80 px-3 py-1.5 sm:px-4 sm:py-2 rounded">
              그림을 보고 맞춰보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
