/**
 * Canvas Service
 * 캔버스 그림 관리 서비스
 */

import { CanvasState, Stroke, Point } from '@/types/canvas';
import { setData, updateData, getData, pushData } from '@/lib/firebase/database';

export class CanvasService {
  /**
   * 캔버스 초기화
   */
  async initCanvas(roomCode: string): Promise<CanvasState> {
    const canvasState: CanvasState = {
      strokes: [],
      lastUpdated: Date.now(),
    };

    await setData(`canvases/${roomCode}`, canvasState);
    return canvasState;
  }

  /**
   * 스트로크 추가
   */
  async addStroke(roomCode: string, stroke: Stroke): Promise<void> {
    const strokeId = await pushData(`canvases/${roomCode}/strokes`, stroke);

    await updateData(`canvases/${roomCode}`, {
      lastUpdated: Date.now(),
    });
  }

  /**
   * 캔버스 지우기
   */
  async clearCanvas(roomCode: string): Promise<void> {
    await setData(`canvases/${roomCode}`, {
      strokes: [],
      lastUpdated: Date.now(),
    });
  }

  /**
   * 캔버스 상태 가져오기
   */
  async getCanvasState(roomCode: string): Promise<CanvasState | null> {
    return await getData<CanvasState>(`canvases/${roomCode}`);
  }

  /**
   * 실행 취소 (마지막 스트로크 제거)
   */
  async undo(roomCode: string): Promise<void> {
    const canvas = await this.getCanvasState(roomCode);
    if (!canvas) return;

    // strokes가 객체일 경우 배열로 변환
    const strokeArray = Array.isArray(canvas.strokes)
      ? canvas.strokes
      : Object.values(canvas.strokes);

    if (strokeArray.length === 0) return;

    const newStrokes = strokeArray.slice(0, -1);
    await setData(`canvases/${roomCode}`, {
      strokes: newStrokes,
      lastUpdated: Date.now(),
    });
  }
}

// Singleton instance
export const canvasService = new CanvasService();
