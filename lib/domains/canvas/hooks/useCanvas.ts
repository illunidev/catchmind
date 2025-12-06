/**
 * useCanvas Hook
 * 캔버스 그리기 및 상태 관리 훅
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CanvasState, Stroke, Point, ToolType } from '@/types/canvas';
import { listenToValue, listenToChildAdded } from '@/lib/firebase/database';
import { canvasService } from '../services/canvasService';

interface UseCanvasOptions {
  roomCode: string;
  isDrawer: boolean;
}

export function useCanvas({ roomCode, isDrawer }: UseCanvasOptions) {
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentStrokeRef = useRef<Point[]>([]);

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);

  /**
   * 스트로크 그리기
   */
  const drawStroke = useCallback((stroke: Stroke) => {
    const context = contextRef.current;
    if (!context || stroke.points.length === 0) return;

    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.lineWidth;

    if (stroke.tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }

    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      context.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    context.stroke();
  }, []);

  /**
   * 캔버스 전체 다시 그리기
   */
  const redrawCanvas = useCallback((strokes: Stroke[] | Record<string, Stroke>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // 캔버스 지우기
    context.clearRect(0, 0, canvas.width, canvas.height);

    // strokes가 객체일 경우 배열로 변환
    const strokeArray = Array.isArray(strokes)
      ? strokes
      : Object.values(strokes);

    // 모든 스트로크 그리기
    strokeArray.forEach((stroke) => {
      drawStroke(stroke);
    });
  }, [drawStroke]);

  // 캔버스 상태 리스너
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = listenToValue(
      `canvases/${roomCode}`,
      (snapshot) => {
        const data = snapshot.val() as CanvasState | null;
        setCanvasState(data);
        setLoading(false);

        // 캔버스에 그리기
        if (data && contextRef.current && data.strokes) {
          redrawCanvas(data.strokes);
        }
      }
    );

    return () => unsubscribe();
  }, [roomCode, redrawCanvas]);

  // 새 스트로크 리스너 (실시간 그리기)
  useEffect(() => {
    if (!roomCode || !contextRef.current) return;

    const unsubscribe = listenToChildAdded(
      `canvases/${roomCode}/strokes`,
      (snapshot) => {
        const stroke = snapshot.val() as Stroke | null;
        if (stroke && contextRef.current) {
          drawStroke(stroke);
        }
      }
    );

    return () => unsubscribe();
  }, [roomCode, drawStroke]);

  /**
   * 그리기 시작
   */
  const startDrawing = useCallback((x: number, y: number) => {
    if (!isDrawer) return;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y }];
  }, [isDrawer]);

  /**
   * 그리기 중
   */
  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing || !isDrawer) return;

    currentStrokeRef.current.push({ x, y });

    // 로컬에서 즉시 그리기 (부드러운 UX)
    const context = contextRef.current;
    if (context) {
      context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = lineWidth;

      if (tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }

      const points = currentStrokeRef.current;
      if (points.length >= 2) {
        const lastPoint = points[points.length - 2];
        const currentPoint = points[points.length - 1];

        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(currentPoint.x, currentPoint.y);
        context.stroke();
      }
    }
  }, [isDrawing, isDrawer, tool, color, lineWidth]);

  /**
   * 그리기 종료
   */
  const stopDrawing = useCallback(async () => {
    if (!isDrawing || !isDrawer) return;

    setIsDrawing(false);

    // Firebase에 스트로크 저장
    if (currentStrokeRef.current.length > 0) {
      const stroke: Stroke = {
        tool,
        color,
        lineWidth,
        points: currentStrokeRef.current,
      };

      await canvasService.addStroke(roomCode, stroke);
    }

    currentStrokeRef.current = [];
  }, [isDrawing, isDrawer, roomCode, tool, color, lineWidth]);

  /**
   * 캔버스 지우기
   */
  const clearCanvas = useCallback(async () => {
    if (!isDrawer) return;

    await canvasService.clearCanvas(roomCode);
  }, [isDrawer, roomCode]);

  /**
   * 실행 취소
   */
  const undo = useCallback(async () => {
    if (!isDrawer) return;

    await canvasService.undo(roomCode);
  }, [isDrawer, roomCode]);

  return {
    canvasRef,
    canvasState,
    tool,
    setTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    isDrawing,
    loading,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
  };
}
