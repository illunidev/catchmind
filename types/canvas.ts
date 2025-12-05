/**
 * Canvas Domain Types
 * 캔버스 그리기 관련 타입 정의
 */

export interface Point {
  x: number;
  y: number;
}

export type ToolType = 'pen' | 'eraser';

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: ToolType;
  timestamp: number;
}

export interface CanvasState {
  strokes: Record<string, Stroke>;
  cleared: boolean;
  lastUpdated: number;
}

export interface DrawingTool {
  type: ToolType;
  color: string;
  size: number;
}
