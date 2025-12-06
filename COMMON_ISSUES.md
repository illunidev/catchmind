# 공통 이슈 및 주의사항

프로젝트 전반에 걸쳐 발생하는 공통 이슈와 해결 방법을 정리합니다.

---

## React 관련

### 1. useState/useEffect Dependency 배열

**문제:**
useEffect의 dependency 배열에 필요한 값을 누락하거나, 불필요한 값을 포함하여 무한 루프 발생

**해결 방법:**
```typescript
// ❌ 잘못된 예 - dependency 누락
useEffect(() => {
  fetchData(userId);
}, []); // userId 변경 시 재실행 안 됨

// ✅ 올바른 예
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

**주의사항:**
- ESLint의 `react-hooks/exhaustive-deps` 경고를 무시하지 말 것
- 객체/배열을 dependency로 사용할 때는 useMemo/useCallback 사용

---

## TypeScript 관련

### 1. 타입 단언(Type Assertion) 남용

**문제:**
`as` 키워드로 타입을 강제 변환하여 런타임 오류 발생 가능

**해결 방법:**
```typescript
// ❌ 잘못된 예
const data = snapshot.val() as MyType;

// ✅ 올바른 예 - 타입 가드 사용
const data = snapshot.val();
if (!data || typeof data !== 'object') return;
// 추가 검증 후 사용
```

**주의사항:**
- 타입 단언은 정말 필요한 경우에만 사용
- Firebase 데이터처럼 외부 데이터는 런타임 검증 필수

---

## Next.js 관련

### 1. Client/Server Component 혼용

**문제:**
'use client' 지시어 없이 클라이언트 전용 기능(useState, useEffect 등) 사용

**해결 방법:**
```typescript
// ❌ 잘못된 예 - 'use client' 없음
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(0); // 오류!
}

// ✅ 올바른 예
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(0);
}
```

### 2. router.push vs router.replace

**차이점:**
- `router.push()`: 히스토리에 추가 (뒤로 가기 가능)
- `router.replace()`: 히스토리 대체 (뒤로 가기 시 이전 페이지로)

**사용 예:**
```typescript
// 로그인 후 리다이렉트 - replace 사용 (뒤로가기 방지)
router.replace('/lobby');

// 일반 페이지 이동 - push 사용
router.push('/room/ABC123');
```

---

## 상태 관리 관련

### 1. setState 중복 호출

**문제:**
동일한 렌더링 사이클에서 setState를 여러 번 호출하면 배칭되어 예상과 다르게 동작

**해결 방법:**
```typescript
// ❌ 잘못된 예
setCount(count + 1);
setCount(count + 1); // count는 여전히 이전 값

// ✅ 올바른 예 - 함수형 업데이트
setCount(prev => prev + 1);
setCount(prev => prev + 1); // 정상 작동
```

---

## 비동기 처리 관련

### 1. Promise 체이닝 vs async/await

**권장:**
가독성을 위해 async/await 사용

```typescript
// ❌ Promise 체이닝 (복잡)
roomService.createRoom(data)
  .then(room => roomService.joinRoom(userId, room.code))
  .then(() => router.push('/room'))
  .catch(err => setError(err.message));

// ✅ async/await (가독성 좋음)
try {
  const room = await roomService.createRoom(data);
  await roomService.joinRoom(userId, room.code);
  router.push('/room');
} catch (err) {
  setError((err as Error).message);
}
```

### 2. 병렬 처리 최적화

**문제:**
순차적으로 실행 가능한 비동기 작업을 동기식으로 처리

**해결 방법:**
```typescript
// ❌ 순차 실행 (느림)
const user = await getUser(userId);
const room = await getRoom(roomId);

// ✅ 병렬 실행 (빠름)
const [user, room] = await Promise.all([
  getUser(userId),
  getRoom(roomId)
]);
```

---

## 성능 관련

### 1. 불필요한 리렌더링

**문제:**
컴포넌트가 props나 state 변경 없이 리렌더링됨

**해결 방법:**
```typescript
// useMemo로 계산 비용이 큰 값 메모이제이션
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback으로 함수 메모이제이션
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

---

## 관련 문서
- [Firebase 주의사항](lib/firebase/README.md)
- [Canvas 주의사항](lib/domains/canvas/README.md)
