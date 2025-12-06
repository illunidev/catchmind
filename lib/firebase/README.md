# Firebase 사용 가이드 및 주의사항

이 문서는 Firebase Realtime Database 사용 시 주의사항과 자주 발생하는 이슈를 정리합니다.

## 주의사항

### 1. 배열 처리 이슈

**문제:**
Firebase Realtime Database는 배열을 객체로 저장합니다. 따라서 데이터를 가져올 때 배열이 아닌 객체 형태로 반환될 수 있습니다.

**발생 원인:**
- Firebase는 배열을 `{ 0: item1, 1: item2 }` 형태의 객체로 저장
- `.forEach()`, `.map()`, `.slice()` 등 배열 메서드 사용 시 오류 발생

**해결 방법:**
배열 메서드 사용 전 반드시 `Array.isArray()` 체크 후 `Object.values()`로 변환

```typescript
// ❌ 잘못된 예
const strokes = data.strokes;
strokes.forEach(stroke => { ... }); // 오류 발생 가능

// ✅ 올바른 예
const strokeArray = Array.isArray(data.strokes)
  ? data.strokes
  : Object.values(data.strokes);
strokeArray.forEach(stroke => { ... });
```

**발생 위치:**
- `lib/domains/canvas/hooks/useCanvas.ts` - `redrawCanvas` 함수
- `lib/domains/canvas/services/canvasService.ts` - `undo` 함수
- 기타 Firebase에서 배열 데이터를 가져오는 모든 곳

### 2. 실시간 리스너 정리

**주의사항:**
Firebase 리스너는 컴포넌트 언마운트 시 반드시 정리해야 메모리 누수를 방지할 수 있습니다.

```typescript
// ✅ 올바른 예
useEffect(() => {
  const unsubscribe = listenToValue('path', (snapshot) => {
    // 처리 로직
  });

  return () => unsubscribe(); // 정리 필수!
}, []);
```

### 3. 환경 변수 설정

Firebase 설정은 반드시 `.env.local` 파일에 저장:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. 방 삭제 시 연관 데이터 정리

**문제:**
방(Room) 삭제 시 게임 관련 데이터가 남아 DB에 고아 데이터(orphan data)가 쌓임

**발생 원인:**
- 방은 `roomId` 기반, 게임 데이터는 `roomCode` 기반으로 저장
- 서비스 분리(RoomService/GameService)로 삭제 책임이 불명확
- 점진적 개발로 새 경로 추가 시 기존 삭제 로직 업데이트 누락

**삭제해야 할 경로:**
```
/rooms/{roomId}           # roomId 기반
/roomDetails/{roomId}     # roomId 기반
/gameStates/{roomCode}    # roomCode 기반
/rounds/{roomCode}        # roomCode 기반
/gameResults/{roomCode}   # roomCode 기반
/canvases/{roomCode}      # roomCode 기반
```

**해결 방법:**
방 삭제 시 `room.code`를 먼저 조회하여 모든 경로를 한 번에 삭제

```typescript
// ✅ 올바른 예 (roomService.deleteRoom)
async deleteRoom(roomId: string): Promise<void> {
  const room = await getData<Room>(`rooms/${roomId}`);
  const roomCode = room?.code;

  const updates: Record<string, any> = {};
  updates[`rooms/${roomId}`] = null;
  updates[`roomDetails/${roomId}`] = null;

  if (roomCode) {
    updates[`gameStates/${roomCode}`] = null;
    updates[`rounds/${roomCode}`] = null;
    updates[`gameResults/${roomCode}`] = null;
    updates[`canvases/${roomCode}`] = null;
  }

  await updateMultiplePaths(updates);
}
```

**체크리스트 (새 데이터 경로 추가 시):**
- [ ] 해당 데이터가 방에 종속되는가?
- [ ] 방 삭제 시 함께 삭제되어야 하는가?
- [ ] `roomService.deleteRoom()`, `leaveRoom()`, `cleanupFinishedRooms()`에 추가했는가?

## 관련 파일
- `lib/firebase/config.ts` - Firebase 초기화
- `lib/firebase/database.ts` - Database 유틸 함수
- `lib/domains/room/services/roomService.ts` - 방 생성/삭제 로직
