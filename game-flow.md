# 게임 플로우 및 상태 전환

이 문서는 Catchmind 게임의 전체 흐름과 각 상태 전환을 상세히 설명합니다.

---

## 전체 게임 플로우

```
┌──────────┐
│  로그인   │ (/)
│닉네임 입력│
└─────┬────┘
      │
      ↓
┌──────────┐
│   로비    │ (/lobby)
│방 목록/생성│
└─────┬────┘
      │ 방 생성 or 방 참가
      ↓
┌──────────┐
│  대기실   │ (/room/[code]/waiting)
│게임 준비  │ status: 'waiting'
└─────┬────┘
      │ [방장이 게임 시작]
      ↓
┌──────────┐
│제시어 선택│ (/room/[code]/playing)
│  (Drawer) │ phase: 'choosing'
└─────┬────┘
      │ [단어 선택 완료]
      ↓
┌──────────┐
│게임 진행  │ (/room/[code]/playing)
│그리기/맞추기│ phase: 'drawing'
└─────┬────┘
      │ [타이머 종료 or 모두 정답]
      ↓
┌──────────┐
│라운드 결과│ (/room/[code]/playing)
│점수 표시  │ phase: 'roundEnd' (3초)
└─────┬────┘
      │
      ├─→ [다음 라운드 있음] → 제시어 선택
      │
      ↓ [마지막 라운드]
┌──────────┐
│게임 종료  │ (/room/[code]/finished)
│최종 순위  │ status: 'finished'
└─────┬────┘
      │
      ├─→ [한판 더] → 대기실
      │
      └─→ [나가기] → 로비
```

---

## 1. Room Status (방 상태)

### 상태 정의
```typescript
type RoomStatus = 'waiting' | 'playing' | 'finished';
```

### 상태 전환 다이어그램

```
       ┌──────────┐
       │ waiting  │ ← 초기 상태 (방 생성 시)
       │  대기중   │
       └────┬─────┘
            │
            │ [방장이 게임 시작]
            │ - 최소 2명 이상
            │
            ↓
       ┌──────────┐
       │ playing  │
       │  진행중   │
       └────┬─────┘
            │
            │ [모든 라운드 종료]
            │
            ↓
       ┌──────────┐
       │ finished │
       │  종료됨   │
       └────┬─────┘
            │
            ├─→ [한판 더] → waiting
            │
            └─→ [나가기] → 방 삭제 or 다른 플레이어 대기
```

### 상태별 가능한 동작

| Status | 가능한 동작 | 불가능한 동작 |
|--------|-------------|---------------|
| `waiting` | 방 설정 변경, 플레이어 참가/나가기, 게임 시작 | 그리기, 채팅 정답 체크 |
| `playing` | 그리기, 채팅, 정답 입력, 라운드 진행 | 방 설정 변경, 새 플레이어 참가 |
| `finished` | 결과 확인, 한판 더, 나가기 | 그리기, 새 플레이어 참가 |

---

## 2. Game Phase (게임 단계)

### 상태 정의
```typescript
type GamePhase = 'choosing' | 'drawing' | 'roundEnd' | 'finished';
```

### 상태 전환 다이어그램

```
    [게임 시작]
        │
        ↓
   ┌──────────┐
   │ choosing │ ← 제시어 선택 단계
   │제시어 선택│   - Drawer만 선택 가능
   └────┬─────┘   - 20초 타이머
        │          - 자동 선택 (시간 초과 시)
        │
        │ [단어 선택 완료]
        │
        ↓
   ┌──────────┐
   │ drawing  │ ← 게임 진행 단계
   │그리기/맞추기│  - 60초 타이머
   └────┬─────┘   - Drawer: 그리기
        │          - Guessers: 정답 맞추기
        │
        │ [타이머 종료 or 모두 정답]
        │
        ↓
   ┌──────────┐
   │ roundEnd │ ← 라운드 결과 단계
   │ 결과 표시 │   - 3초 고정
   └────┬─────┘   - 정답 공개
        │          - 점수 표시
        │
        ├─→ [다음 라운드 있음] → choosing
        │
        ↓ [마지막 라운드]
   ┌──────────┐
   │ finished │ ← 게임 종료 단계
   │ 최종 순위 │   - 순위 표시
   └──────────┘   - 점수 집계
```

### 단계별 타이머

| Phase | 시간 | 자동 전환 |
|-------|------|-----------|
| `choosing` | 20초 | 시간 초과 시 첫 번째 선택지 자동 선택 |
| `drawing` | 60초 | 시간 종료 시 `roundEnd`로 전환 |
| `roundEnd` | 3초 | 자동으로 다음 라운드 or `finished`로 전환 |
| `finished` | 무제한 | 수동 전환 (한판 더 or 나가기) |

---

## 3. Player Status (플레이어 상태)

### 상태 정의
```typescript
type PlayerStatus = 'idle' | 'choosing' | 'drawing' | 'guessing' | 'answered';
```

### 상태 전환 다이어그램

```
   ┌──────────┐
   │   idle   │ ← 대기실 or 라운드 대기
   │   대기    │
   └────┬─────┘
        │
        ├─→ [Drawer로 지정됨] → choosing
        │
        └─→ [Guesser로 지정됨] → guessing


   [Drawer의 경우]

   ┌──────────┐
   │ choosing │ ← 제시어 선택 중
   │ 선택 중  │
   └────┬─────┘
        │
        │ [단어 선택 완료]
        │
        ↓
   ┌──────────┐
   │ drawing  │ ← 그리는 중
   │ 그리는중 │
   └────┬─────┘
        │
        │ [라운드 종료]
        │
        ↓
      idle


   [Guesser의 경우]

   ┌──────────┐
   │ guessing │ ← 정답 맞추는 중
   │ 맞추는중 │
   └────┬─────┘
        │
        ├─→ [정답 맞춤] → answered
        │
        └─→ [라운드 종료] → idle

   ┌──────────┐
   │ answered │ ← 정답 맞춘 상태
   │ 정답완료 │   (더 이상 정답 입력 불가)
   └────┬─────┘
        │
        │ [라운드 종료]
        │
        ↓
      idle
```

---

## 4. 페이지별 상태 관리

### 4.1 로그인 페이지 (`/`)

**관리 상태**: User

```typescript
// app/page.tsx
const { user, loading, createUser } = useUser();

// 상태 전환
null → [닉네임 입력] → User 생성 → /lobby로 리다이렉트
```

---

### 4.2 로비 페이지 (`/lobby`)

**관리 상태**: User, Room List

```typescript
// app/lobby/page.tsx
const { user } = useUser();
const { rooms, loading } = useRoomList();

// 상태 전환
로그인 확인 → [방 생성/참가] → /room/[code]/waiting으로 이동
```

---

### 4.3 대기실 페이지 (`/room/[code]/waiting`)

**관리 상태**: Room, Players, User

```typescript
// app/room/[code]/waiting/page.tsx
const { room } = useRoom(roomCode);
const { players } = useRoomPlayers(roomCode);

// 상태 전환
room.status = 'waiting'
  → [방장이 게임 시작]
  → room.status = 'playing'
  → /room/[code]/playing으로 리다이렉트
```

**조건**:
- 최소 2명 이상
- 방장만 시작 가능

---

### 4.4 게임 진행 페이지 (`/room/[code]/playing`)

**관리 상태**: Game, Round, Canvas, Chat, Players

```typescript
// app/room/[code]/playing/page.tsx
const { gameState } = useGame(roomCode);
const { canvasRef, draw } = useCanvas(roomCode, isDrawer);
const { messages, sendMessage } = useChat(roomCode);

// 상태 전환
gameState.phase = 'choosing'  (제시어 선택)
  → [20초 or 선택 완료]
  → gameState.phase = 'drawing'  (그리기/맞추기)
  → [60초 or 모두 정답]
  → gameState.phase = 'roundEnd'  (결과 표시, 3초)
  → [다음 라운드 있음] → 'choosing'
  → [마지막 라운드] → 'finished'
  → /room/[code]/finished로 리다이렉트
```

---

### 4.5 게임 종료 페이지 (`/room/[code]/finished`)

**관리 상태**: Room, Game, Players

```typescript
// app/room/[code]/finished/page.tsx
const { room } = useRoom(roomCode);
const { gameState } = useGame(roomCode);
const { players } = useRoomPlayers(roomCode);

// 상태 전환
room.status = 'finished'
  → [한판 더] → room.status = 'waiting', /room/[code]/waiting으로 이동
  → [나가기] → /lobby로 이동
```

---

## 5. 타이머 관리

### 타이머 종류

| 타이머 | 위치 | 시간 | 동작 |
|--------|------|------|------|
| 제시어 선택 | `choosing` phase | 20초 | 자동 선택 후 `drawing` phase로 전환 |
| 라운드 진행 | `drawing` phase | 60초 | `roundEnd` phase로 전환 |
| 라운드 결과 | `roundEnd` phase | 3초 | 다음 라운드 or `finished`로 전환 |
| 종료 페이지 전 대기 | `drawing` → `finished` | 1초 | `/room/[code]/finished`로 리다이렉트 |

### 타이머 구현

```typescript
// lib/domains/game/hooks/useTimer.ts
export function useTimer(initialSeconds: number, onComplete: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return timeLeft;
}
```

---

## 6. 조기 종료 조건

### 6.1 라운드 조기 종료

**조건**: 모든 Guesser가 정답을 맞춤

```typescript
// gameService.ts
async function checkAllAnswered(roundId: string) {
  const round = await getRound(roundId);
  const players = await getPlayers(round.roomId);

  const guessers = players.filter(p => p.userId !== round.drawerUserId);
  const answeredCount = round.answeredOrder.length;

  if (answeredCount >= guessers.length) {
    // 모두 정답 → 라운드 조기 종료
    await endRound(roundId);
  }
}
```

### 6.2 게임 강제 종료

**조건**: 플레이어가 1명만 남음

```typescript
// roomService.ts
async function handlePlayerLeave(roomId: string, userId: string) {
  const players = await getPlayers(roomId);

  if (players.length <= 1) {
    // 게임 강제 종료
    await gameService.endGame(roomId);
  }
}
```

---

## 7. 에러 상태 및 복구

### 7.1 네트워크 끊김

```typescript
// 플레이어 연결 상태 감지
onDisconnect(playerRef).set({ isOnline: false });

// 재연결 시
onReconnect(() => {
  // 현재 게임 상태 다시 로드
  const gameState = await getGameState(roomCode);
  syncToCurrentPhase(gameState.phase);
});
```

### 7.2 잘못된 상태 전환

```typescript
// 각 페이지에서 상태 검증
useEffect(() => {
  if (!gameState) return;

  // playing 페이지인데 게임이 finished 상태
  if (gameState.status === 'finished') {
    router.replace(`/room/${roomCode}/finished`);
  }

  // playing 페이지인데 게임이 waiting 상태
  if (gameState.status === 'waiting') {
    router.replace(`/room/${roomCode}/waiting`);
  }
}, [gameState]);
```

---

## 8. 상태 동기화

### Firebase Realtime Database 리스너

```typescript
// 각 페이지에서 실시간 상태 구독
useEffect(() => {
  const unsubscribe = listenToValue(`gameStates/${roomCode}`, (snapshot) => {
    const state = snapshot.val();
    setGameState(state);

    // 상태에 따른 페이지 전환
    if (state.status === 'finished') {
      router.push(`/room/${roomCode}/finished`);
    }
  });

  return () => unsubscribe();
}, [roomCode]);
```

---

## 관련 문서
- [도메인 모델](domain-model.md): 상태 관련 엔티티 정의
- [도메인 간 의존성](domain-dependencies.md): 상태 전환 시 도메인 간 상호작용
- [Use Cases](use-cases.md): 구체적인 시나리오별 상태 전환
- [Firebase 데이터베이스 구조](firebase-database-structure.md): 상태 저장 구조
