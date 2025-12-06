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

## 관련 파일
- `lib/firebase/config.ts` - Firebase 초기화
- `lib/firebase/database.ts` - Database 유틸 함수
