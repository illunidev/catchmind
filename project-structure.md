# 프로젝트 구조

## 전체 구조 개요

```
catchmind/
├── app/                        # Next.js App Router
│   ├── page.tsx               # / (로비/홈 화면)
│   ├── layout.tsx             # 루트 레이아웃
│   ├── globals.css            # 전역 스타일
│   └── room/
│       └── [code]/
│           └── page.tsx       # /room/KF652739 (게임 화면)
│
├── components/                 # React 컴포넌트
│   ├── game/                  # 게임 관련 컴포넌트
│   │   ├── TopBar.tsx
│   │   ├── CanvasBoard.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── UserStrip.tsx
│   │   ├── WordChoiceModal.tsx
│   │   ├── GameOverModal.tsx
│   │   ├── HowToModal.tsx
│   │   └── SoundSettingModal.tsx
│   ├── lobby/                 # 로비 관련 컴포넌트
│   │   ├── CreateRoomForm.tsx
│   │   ├── JoinRoomForm.tsx
│   │   └── NicknameInput.tsx
│   └── shared/                # 공통 컴포넌트
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       └── Loading.tsx
│
├── lib/                        # 비즈니스 로직 및 유틸리티
│   ├── domains/               # 도메인별 로직 분리
│   │   ├── user/
│   │   │   ├── hooks/
│   │   │   │   └── useUser.ts
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   └── types.ts
│   │   ├── room/
│   │   │   ├── hooks/
│   │   │   │   ├── useRoom.ts
│   │   │   │   └── useRoomList.ts
│   │   │   ├── services/
│   │   │   │   └── roomService.ts
│   │   │   └── types.ts
│   │   ├── game/
│   │   │   ├── hooks/
│   │   │   │   ├── useGame.ts
│   │   │   │   ├── useTimer.ts
│   │   │   │   └── useRound.ts
│   │   │   ├── services/
│   │   │   │   ├── gameService.ts
│   │   │   │   └── roundService.ts
│   │   │   └── types.ts
│   │   ├── canvas/
│   │   │   ├── hooks/
│   │   │   │   ├── useCanvas.ts
│   │   │   │   └── useDrawing.ts
│   │   │   ├── services/
│   │   │   │   └── canvasService.ts
│   │   │   └── types.ts
│   │   ├── chat/
│   │   │   ├── hooks/
│   │   │   │   └── useChat.ts
│   │   │   ├── services/
│   │   │   │   └── chatService.ts
│   │   │   └── types.ts
│   │   ├── answer/
│   │   │   ├── hooks/
│   │   │   │   └── useAnswer.ts
│   │   │   ├── services/
│   │   │   │   └── answerService.ts
│   │   │   └── types.ts
│   │   └── word/
│   │       ├── hooks/
│   │       │   └── useWord.ts
│   │       ├── services/
│   │       │   └── wordService.ts
│   │       └── types.ts
│   ├── firebase/              # Firebase 설정 및 헬퍼
│   │   ├── config.ts          # Firebase 초기화
│   │   ├── database.ts        # Database 헬퍼 함수
│   │   ├── auth.ts            # 인증 관련
│   │   └── presence.ts        # 접속 상태 관리
│   └── utils/                 # 유틸리티 함수
│       ├── constants.ts       # 상수
│       ├── helpers.ts         # 헬퍼 함수
│       └── validation.ts      # 검증 함수
│
├── types/                      # 전역 TypeScript 타입
│   ├── index.ts               # 통합 export
│   ├── user.ts
│   ├── room.ts
│   ├── game.ts
│   ├── canvas.ts
│   └── chat.ts
│
├── public/                     # 정적 파일
│   ├── avatars/               # 아바타 이미지
│   └── sounds/                # 효과음 (선택)
│
├── docs/                       # 문서
│   ├── features.md
│   ├── domain-model.md
│   ├── use-cases.md
│   ├── catchmind-spec.md
│   └── firebase-database-structure.md
│
├── .env.local                  # 환경 변수 (git ignore)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── claude.md                   # 프로젝트 개요
```

---

## 라우팅 구조

### App Router (Next.js 13+)

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 로비/홈 화면 (닉네임 입력, 방 생성/참가) |
| `/room/[code]` | `app/room/[code]/page.tsx` | 게임 화면 (방 코드 동적 라우팅) |

### 라우팅 예시

```typescript
// app/page.tsx (로비)
export default function LobbyPage() {
  return <Lobby />;
}

// app/room/[code]/page.tsx (게임 화면)
export default function RoomPage({ params }: { params: { code: string } }) {
  return <GameRoom roomCode={params.code} />;
}
```

---

## 도메인별 책임 분리

### 1. User Domain
**책임**: 유저 생성, 인증, 프로필 관리

```typescript
// lib/domains/user/services/userService.ts
export class UserService {
  createGuestUser(nickname: string): Promise<User>
  getUserById(userId: string): Promise<User>
  updateProfile(userId: string, data: Partial<User>): Promise<void>
}

// lib/domains/user/hooks/useUser.ts
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  // ...
}
```

---

### 2. Room Domain
**책임**: 방 생성, 참가, 설정 관리

```typescript
// lib/domains/room/services/roomService.ts
export class RoomService {
  createRoom(hostUserId: string, settings: RoomSettings): Promise<Room>
  joinRoom(userId: string, roomCode: string): Promise<void>
  leaveRoom(userId: string, roomId: string): Promise<void>
  updateSettings(roomId: string, settings: RoomSettings): Promise<void>
}

// lib/domains/room/hooks/useRoom.ts
export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  // ...
}
```

---

### 3. Game Domain
**책임**: 게임 세션 관리, 라운드 진행

```typescript
// lib/domains/game/services/gameService.ts
export class GameService {
  startGame(roomId: string): Promise<void>
  startRound(gameId: string, roundIndex: number): Promise<void>
  endRound(roundId: string): Promise<void>
  endGame(gameId: string): Promise<Ranking[]>
}

// lib/domains/game/hooks/useGame.ts
export function useGame(roomId: string) {
  const [game, setGame] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('lobby');
  // ...
}
```

---

### 4. Canvas Domain
**책임**: 캔버스 그리기, 스트로크 동기화

```typescript
// lib/domains/canvas/services/canvasService.ts
export class CanvasService {
  sendStroke(roomId: string, stroke: Stroke): Promise<void>
  clearCanvas(roomId: string): Promise<void>
  subscribeToStrokes(roomId: string, callback: (stroke: Stroke) => void): () => void
}

// lib/domains/canvas/hooks/useCanvas.ts
export function useCanvas(roomId: string, isDrawer: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = (stroke: Stroke) => { /* ... */ };
  // ...
}
```

---

### 5. Chat Domain
**책임**: 채팅 메시지 전송, 정답 체크

```typescript
// lib/domains/chat/services/chatService.ts
export class ChatService {
  sendMessage(roomId: string, userId: string, content: string): Promise<void>
  sendSystemMessage(roomId: string, content: string): Promise<void>
  subscribeToMessages(roomId: string, callback: (message: ChatMessage) => void): () => void
}

// lib/domains/chat/hooks/useChat.ts
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const sendMessage = (content: string) => { /* ... */ };
  // ...
}
```

---

### 6. Answer Domain
**책임**: 정답 매칭, 점수 계산

```typescript
// lib/domains/answer/services/answerService.ts
export class AnswerService {
  checkAnswer(roundId: string, userId: string, answer: string): Promise<boolean>
  calculateScore(order: number, remainingSeconds: number): number
  normalizeAnswer(text: string): string
}

// lib/domains/answer/hooks/useAnswer.ts
export function useAnswer(roundId: string) {
  const submitAnswer = (answer: string) => { /* ... */ };
  // ...
}
```

---

### 7. Word Domain
**책임**: 제시어 관리, 선택

```typescript
// lib/domains/word/services/wordService.ts
export class WordService {
  getWordChoices(category: string, difficulty: string): Promise<Word[]>
  chooseWord(roundId: string, wordId: string): Promise<void>
  generateHint(word: string): string
}

// lib/domains/word/hooks/useWord.ts
export function useWord() {
  const [choices, setChoices] = useState<Word[]>([]);
  const chooseWord = (wordId: string) => { /* ... */ };
  // ...
}
```

---

## 컴포넌트 구조

### 1. Game Components (게임 화면)

```typescript
// components/game/TopBar.tsx
interface TopBarProps {
  roundIndex: number;
  totalRounds: number;
  remainingSeconds: number;
  hint: string;
  word?: string; // Drawer에게만
}

// components/game/CanvasBoard.tsx
interface CanvasBoardProps {
  roomId: string;
  isDrawer: boolean;
  strokes: Stroke[];
}

// components/game/ChatPanel.tsx
interface ChatPanelProps {
  roomId: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

// components/game/UserStrip.tsx
interface UserStripProps {
  players: Player[];
  currentUserId: string;
}
```

---

### 2. Lobby Components (로비 화면)

```typescript
// components/lobby/CreateRoomForm.tsx
interface CreateRoomFormProps {
  onCreateRoom: (settings: RoomSettings) => void;
}

// components/lobby/JoinRoomForm.tsx
interface JoinRoomFormProps {
  onJoinRoom: (roomCode: string) => void;
}

// components/lobby/NicknameInput.tsx
interface NicknameInputProps {
  onSubmit: (nickname: string) => void;
}
```

---

### 3. Shared Components (공통)

```typescript
// components/shared/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
}

// components/shared/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

---

## 타입 정의 구조

### types/ 폴더 구조

```typescript
// types/index.ts (통합 export)
export * from './user';
export * from './room';
export * from './game';
export * from './canvas';
export * from './chat';

// types/user.ts
export interface User {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: number;
}

// types/room.ts
export interface Room {
  id: string;
  code: string;
  title: string;
  hostUserId: string;
  status: RoomStatus;
  settings: RoomSettings;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished';

// types/game.ts
export interface GameState {
  gameId: string;
  phase: GamePhase;
  roundIndex: number;
  totalRounds: number;
  drawerUserId: string;
  remainingSeconds: number;
}

export type GamePhase = 'lobby' | 'choosing' | 'drawing' | 'roundEnd' | 'gameEnd';

// types/canvas.ts
export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
}

// types/chat.ts
export interface ChatMessage {
  id: string;
  userId: string | null;
  type: 'user' | 'system' | 'answer';
  content: string;
  timestamp: number;
}
```

---

## Firebase 헬퍼 구조

### lib/firebase/ 폴더 구조

```typescript
// lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ...
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// lib/firebase/database.ts
import { ref, set, get, update, remove, onValue, onChildAdded } from 'firebase/database';

export const dbHelpers = {
  set: (path: string, data: any) => set(ref(db, path), data),
  get: (path: string) => get(ref(db, path)),
  update: (updates: Record<string, any>) => update(ref(db), updates),
  remove: (path: string) => remove(ref(db, path)),
  listen: (path: string, callback: (snapshot: any) => void) => {
    const unsubscribe = onValue(ref(db, path), callback);
    return unsubscribe;
  },
  listenChildAdded: (path: string, callback: (snapshot: any) => void) => {
    const unsubscribe = onChildAdded(ref(db, path), callback);
    return unsubscribe;
  },
};

// lib/firebase/presence.ts
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';

export const setupPresence = (roomId: string, userId: string) => {
  const userStatusRef = ref(db, `roomDetails/${roomId}/players/${userId}/isOnline`);
  const userLastSeenRef = ref(db, `roomDetails/${roomId}/players/${userId}/lastSeen`);

  onDisconnect(userStatusRef).set(false);
  onDisconnect(userLastSeenRef).set(serverTimestamp());
  set(userStatusRef, true);
};
```

---

## 유틸리티 구조

### lib/utils/ 폴더 구조

```typescript
// lib/utils/constants.ts
export const CONSTANTS = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  ROUND_TIME: 60,
  ROOM_CODE_LENGTH: 8,
  MAX_NICKNAME_LENGTH: 20,
  CANVAS_THROTTLE_MS: 50,
  CHAT_MAX_MESSAGES: 50,
};

export const SCORES = {
  FIRST: 10,
  SECOND: 7,
  THIRD: 5,
  DEFAULT: 3,
  DRAWER_BASE: 5,
  DRAWER_ALL_CORRECT: 3,
};

// lib/utils/helpers.ts
export const generateRoomCode = (): string => {
  // KF652739 형식
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const calculateTotalRounds = (playerCount: number): number => {
  return playerCount <= 3 ? playerCount * 2 : playerCount;
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// lib/utils/validation.ts
export const validateNickname = (nickname: string): boolean => {
  return nickname.length >= 1 && nickname.length <= 20;
};

export const validateRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(code);
};
```

---

## SOLID 원칙 적용

### Single Responsibility Principle (단일 책임)
- 각 도메인 서비스는 하나의 책임만 가짐
- `UserService` → 유저 관리만
- `GameService` → 게임 진행만

### Open/Closed Principle (개방/폐쇄)
- 서비스 인터페이스를 통한 확장 가능
- 새로운 기능 추가 시 기존 코드 수정 최소화

### Liskov Substitution Principle (리스코프 치환)
- 타입 안정성 보장 (TypeScript strict mode)

### Interface Segregation Principle (인터페이스 분리)
- 각 컴포넌트는 필요한 props만 받음
- 거대한 props 인터페이스 지양

### Dependency Inversion Principle (의존성 역전)
- 컴포넌트는 서비스에 의존 (Firebase 직접 의존 X)
- Hook을 통한 추상화

---

## 다음 단계

1. ✅ 프로젝트 구조 설계 완료
2. ⬜ Next.js 프로젝트 초기화
3. ⬜ Firebase 설정
4. ⬜ 타입 정의 작성
5. ⬜ 도메인 서비스 구현
6. ⬜ UI 컴포넌트 구현

---

*이 문서는 프로젝트 구조 변경사항을 반영하여 업데이트됩니다.*
