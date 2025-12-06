# Canvas Domain

## 책임 및 역할
캔버스 그리기, 스트로크 관리, 실시간 그림 동기화를 담당하는 도메인입니다.

## 주요 서비스

### CanvasService
캔버스 상태를 관리하는 서비스 클래스입니다.

**주요 메서드:**
- `initCanvas(roomCode)` - 캔버스 초기화
- `addStroke(roomCode, stroke)` - 스트로크 추가
- `clearCanvas(roomCode)` - 캔버스 지우기
- `getCanvasState(roomCode)` - 캔버스 상태 조회
- `undo(roomCode)` - 마지막 스트로크 제거 (실행 취소)

## 주요 Hook

### useCanvas
캔버스 그리기 기능과 실시간 동기화를 제공하는 훅입니다.

**파라미터:**
- `roomCode` - 방 코드
- `isDrawer` - 현재 사용자가 그리는 사람인지 여부

**반환 값:**
- `canvasRef` - 캔버스 DOM 참조 (ref)
- `canvasState` - 현재 캔버스 상태
- `tool` - 현재 선택된 도구 ('pen' | 'eraser')
- `setTool` - 도구 변경 함수
- `color` - 현재 색상
- `setColor` - 색상 변경 함수
- `lineWidth` - 선 두께
- `setLineWidth` - 선 두께 변경 함수
- `isDrawing` - 그리기 중 여부
- `loading` - 로딩 상태
- `startDrawing(x, y)` - 그리기 시작
- `draw(x, y)` - 그리기 중
- `stopDrawing()` - 그리기 종료
- `clearCanvas()` - 캔버스 지우기
- `undo()` - 실행 취소

**실시간 구독:**
- `canvases/{roomCode}` - 전체 캔버스 상태
- `canvases/{roomCode}/strokes` - 새 스트로크 추가 (childAdded)

## Use Case 매핑

이 도메인은 다음 Use Case를 담당합니다:

- **UC-4.1**: 그리기 - 출제자가 캔버스에 그림 그리기
- **UC-4.2**: 도구 선택 - 펜, 지우개, 색상, 두께 선택
- **UC-4.3**: 캔버스 지우기 - 전체 캔버스 초기화
- **UC-4.4**: 실시간 동기화 - 모든 플레이어에게 그림 실시간 전송
- **UC-4.5**: 실행 취소 - 마지막 스트로크 제거

## 타입 정의

### Point
```typescript
interface Point {
  x: number;  // X 좌표
  y: number;  // Y 좌표
}
```

### Stroke
```typescript
interface Stroke {
  tool: DrawingTool;      // 도구 타입 ('pen' | 'eraser')
  color: string;          // 색상 (hex)
  lineWidth: number;      // 선 두께
  points: Point[];        // 좌표 배열
}
```

### CanvasState
```typescript
interface CanvasState {
  strokes: Stroke[];      // 스트로크 배열
  lastUpdated: number;    // 마지막 업데이트 시간
}
```

## 그리기 로직

### 1. 로컬 즉시 렌더링
사용자가 그릴 때 즉시 로컬 캔버스에 렌더링하여 부드러운 UX 제공:
```typescript
draw(x, y) {
  // 로컬에 즉시 그리기
  currentStrokeRef.current.push({ x, y });
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  context.lineTo(currentPoint.x, currentPoint.y);
  context.stroke();
}
```

### 2. Firebase 동기화
그리기 종료 시 완성된 스트로크를 Firebase에 저장:
```typescript
stopDrawing() {
  const stroke: Stroke = {
    tool, color, lineWidth,
    points: currentStrokeRef.current
  };
  await canvasService.addStroke(roomCode, stroke);
}
```

### 3. 실시간 수신
다른 플레이어의 그림을 실시간으로 수신하여 렌더링:
```typescript
listenToChildAdded(`canvases/${roomCode}/strokes`, (stroke) => {
  drawStroke(stroke);
});
```

## 캔버스 최적화

### Stroke 압축
불필요한 중간 포인트를 제거하여 데이터 크기 최적화:
```typescript
// 구현 예정: 더글라스-포이커 알고리즘 등 사용
```

### 지우개 구현
`globalCompositeOperation = 'destination-out'`을 사용하여 지우개 효과:
```typescript
if (tool === 'eraser') {
  context.globalCompositeOperation = 'destination-out';
}
```

## 사용 예시

```typescript
import { useCanvas } from '@/lib/domains/canvas/hooks/useCanvas';

function Canvas({ roomCode, isDrawer }) {
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div>
      {isDrawer && (
        <div>
          <button onClick={() => setTool('pen')}>펜</button>
          <button onClick={() => setTool('eraser')}>지우개</button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
          <button onClick={clearCanvas}>전체 지우기</button>
          <button onClick={undo}>실행 취소</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
```

## Firebase 데이터베이스 구조

```
canvases/
  {roomCode}/
    strokes:
      - tool: "pen"
        color: "#000000"
        lineWidth: 3
        points:
          - x: 100
            y: 150
          - x: 105
            y: 155
          ...
      - tool: "eraser"
        color: "#FFFFFF"
        lineWidth: 10
        points: [...]
    lastUpdated: 1234567890
```

## 성능 고려사항

1. **스트로크 단위 저장**: 매 포인트가 아닌 스트로크 단위로 저장하여 DB 쓰기 최소화
2. **로컬 우선 렌더링**: 즉시 로컬에 그려서 지연 없는 UX 제공
3. **childAdded 리스너**: 새 스트로크만 수신하여 불필요한 리렌더링 방지
4. **캔버스 크기 고정**: 반응형 대신 고정 크기로 좌표 계산 단순화

---

## ⚠️ 주의사항 및 자주 발생하는 이슈

### 1. Firebase 배열 처리 이슈 ⭐

**문제:**
`strokes` 배열이 Firebase에서 객체로 반환되어 배열 메서드 사용 시 오류 발생

**원인:**
Firebase Realtime Database는 배열을 `{ 0: item1, 1: item2 }` 형태의 객체로 저장

**해결 방법:**
[Firebase README - 배열 처리 이슈](../../firebase/README.md#1-배열-처리-이슈) 참조

**적용 위치:**
- `useCanvas.ts` - `redrawCanvas` 함수 (line 72-89)
  ```typescript
  const strokeArray = Array.isArray(strokes)
    ? strokes
    : Object.values(strokes);
  ```
- `canvasService.ts` - `undo` 함수 (line 54-70)
  ```typescript
  const strokeArray = Array.isArray(canvas.strokes)
    ? canvas.strokes
    : Object.values(canvas.strokes);
  ```

### 2. Context 초기화

**주의사항:**
캔버스 그리기 전 반드시 context를 초기화하고 설정해야 부드러운 선이 그려집니다.

```typescript
const context = canvas.getContext('2d');
if (!context) return;

context.lineCap = 'round';    // 선 끝 모양
context.lineJoin = 'round';   // 선 연결 부분 모양
```

### 3. 좌표 계산 시 주의

마우스/터치 이벤트에서 캔버스 상대 좌표를 계산할 때 반드시 `getBoundingClientRect()`를 사용:

```typescript
const rect = canvasRef.current?.getBoundingClientRect();
if (!rect) return;

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
```
