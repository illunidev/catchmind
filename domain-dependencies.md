# 도메인 간 의존성 관계

이 문서는 Catchmind 프로젝트의 7개 도메인이 서로 어떻게 상호작용하는지 설명합니다.

---

## 도메인 개요

| 도메인 | 책임 | 위치 |
|--------|------|------|
| **User** | 유저 생성, 인증, 프로필 관리 | `lib/domains/user/` |
| **Room** | 방 생성, 참가, 설정 관리 | `lib/domains/room/` |
| **Game** | 게임 세션 관리, 라운드 진행 | `lib/domains/game/` |
| **Canvas** | 캔버스 그리기, 스트로크 동기화 | `lib/domains/canvas/` |
| **Chat** | 채팅 메시지 전송/수신 | `lib/domains/chat/` |
| **Answer** | 정답 매칭, 점수 계산 | `lib/domains/answer/` |
| **Word** | 제시어 관리, 선택 | `lib/domains/word/` |

---

## 의존성 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                         User Domain                          │
│                    (게스트 유저 관리)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (사용)
┌─────────────────────────────────────────────────────────────┐
│                         Room Domain                          │
│                    (방 생성, 참가 관리)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (게임 시작)
┌─────────────────────────────────────────────────────────────┐
│                         Game Domain                          │
│                  (게임 세션, 라운드 관리)                      │
└─┬──────────┬─────────┬───────────┬──────────────────────────┘
  │          │         │           │
  ↓          ↓         ↓           ↓
┌─────┐  ┌──────┐  ┌──────┐  ┌────────┐
│Word │  │Canvas│  │Chat  │  │Answer  │
│제시어│  │그리기│  │채팅  │  │정답처리│
└─────┘  └──────┘  └──┬───┘  └────────┘
                       │ (정답 체크)
                       └──────→ Answer
```

---

## 도메인별 의존성 상세

### 1. User Domain

**의존 대상**: 없음 (최하위 레이어)

**의존되는 곳**:
- Room → User (방장, 참여자 정보)
- Game → User (drawer, guesser 지정)
- Chat → User (메시지 발신자)
- Answer → User (정답자 기록)

**역할**: 가장 기본적인 도메인으로 다른 도메인에 의존성이 없으며, 다른 모든 도메인에서 참조됨.

---

### 2. Room Domain

**의존 대상**:
- User (방장, 참여자 관리)

**의존되는 곳**:
- Game → Room (게임이 진행되는 방)
- Canvas → Room (방별 캔버스 상태)
- Chat → Room (방별 채팅)

**주요 상호작용**:
```typescript
// roomService.ts
import { userService } from '../user/services/userService';

// 방 생성 시 방장(User) 확인
const host = await userService.getUserById(hostUserId);

// 방 참가 시 유저(User) 확인
const user = await userService.getUserById(userId);
```

**역할**: User를 기반으로 게임 공간을 제공하는 컨테이너 역할.

---

### 3. Game Domain

**의존 대상**:
- Room (게임이 진행되는 방)
- User (drawer, guesser)
- Word (제시어 선택)
- Answer (정답 처리, 점수 계산)

**의존되는 곳**:
- Canvas → Game (라운드별 캔버스)
- Chat → Game (라운드 정보 표시)

**주요 상호작용**:
```typescript
// gameService.ts
import { roomService } from '../../room/services/roomService';
import { wordService } from '../../word/services/wordService';
import { answerService } from '../../answer/services/answerService';

// 게임 시작
const room = await roomService.getRoom(roomCode);
const players = await roomService.getPlayers(roomCode);

// 라운드 시작 시 제시어 선택지 제공
const choices = await wordService.getWordChoices(
  room.settings.category,
  room.settings.difficulty
);

// 라운드 종료 시 drawer 점수 계산
const drawerScore = answerService.calculateDrawerScore(roundId);
```

**역할**: 게임의 핵심 로직을 관리하며, 다른 도메인들을 조율하는 중심 역할.

---

### 4. Canvas Domain

**의존 대상**:
- Room (방별 캔버스 구분)
- Game (라운드별 초기화)

**의존되는 곳**: 없음

**주요 상호작용**:
```typescript
// useCanvas.ts
import { useRoom } from '../../room/hooks/useRoom';
import { useGame } from '../../game/hooks/useGame';

// 라운드 시작 시 캔버스 초기화
useEffect(() => {
  if (gameState?.phase === 'drawing') {
    canvasService.clearCanvas(roomCode);
  }
}, [gameState?.phase]);
```

**역할**: 독립적인 그리기 기능 제공. Room과 Game을 통해 상태만 참조.

---

### 5. Chat Domain

**의존 대상**:
- Room (방별 채팅)
- User (발신자)
- Answer (정답 체크를 위해 채팅 내용 전달)

**의존되는 곳**: 없음

**주요 상호작용**:
```typescript
// chatService.ts
import { answerService } from '../../answer/services/answerService';
import { userService } from '../../user/services/userService';

// 메시지 전송 시 정답 체크
const isCorrect = await answerService.checkAnswer(
  roundId,
  userId,
  message.content
);

if (isCorrect) {
  // 정답 메시지로 변환
  message.type = 'answer';
}
```

**역할**: 채팅 기능 제공하며, Answer와 협력하여 정답 판별.

---

### 6. Answer Domain

**의존 대상**:
- Game (라운드 정보, 제시어)
- User (정답자 기록)

**의존되는 곳**:
- Chat → Answer (채팅 내용 정답 체크)
- Game → Answer (점수 계산)

**주요 상호작용**:
```typescript
// answerService.ts
import { gameService } from '../../game/services/gameService';

// 정답 체크
const round = await gameService.getRound(roundId);
const correctAnswer = round.wordText;

const isCorrect = normalizeAnswer(answerText) === normalizeAnswer(correctAnswer);

// 점수 계산
const order = round.answeredOrder.length; // 정답 순서
const score = calculateScore(order, remainingSeconds);
```

**역할**: 정답 판별 및 점수 계산의 비즈니스 로직 담당.

---

### 7. Word Domain

**의존 대상**: 없음 (독립적)

**의존되는 곳**:
- Game → Word (제시어 선택지 제공)

**주요 상호작용**:
```typescript
// wordService.ts

// 카테고리/난이도별 제시어 선택지 제공
getWordChoices(category: string, difficulty: string): Promise<Word[]> {
  // Firebase에서 필터링하여 4개 랜덤 선택
  const words = await getData<Word[]>(`words/${category}/${difficulty}`);
  return shuffle(words).slice(0, 4);
}

// 힌트 생성
generateHint(word: string): string {
  return `${word.length}글자`;
}
```

**역할**: 제시어 데이터 관리. 독립적으로 동작하며 Game에서만 사용.

---

## 계층 구조 (Layered Architecture)

### Layer 0 (Infrastructure)
- **User**: 가장 기본적인 엔티티
- **Word**: 독립적인 데이터 도메인

### Layer 1 (Core Domain)
- **Room**: User를 기반으로 게임 공간 제공

### Layer 2 (Application)
- **Game**: Room, User, Word, Answer를 조율하는 중심 도메인

### Layer 3 (Features)
- **Canvas**: 그리기 기능 (Room, Game 참조)
- **Chat**: 채팅 기능 (Room, User, Answer 참조)
- **Answer**: 정답 처리 (Game, User 참조)

---

## 순환 의존성 방지 규칙

### 금지 사항
```typescript
// ❌ 절대 금지 - 순환 의존성
// chatService.ts
import { canvasService } from '../../canvas/services/canvasService'; // 금지!

// canvasService.ts
import { chatService } from '../../chat/services/chatService'; // 금지!
```

### 해결 방법
- 공통 로직은 상위 레이어(Game)에서 조율
- 필요 시 이벤트 기반으로 통신

```typescript
// ✅ 올바른 방법 - Game에서 조율
// gameService.ts
import { canvasService } from '../../canvas/services/canvasService';
import { chatService } from '../../chat/services/chatService';

async function startRound(roundId: string) {
  await canvasService.clearCanvas(roomCode);
  await chatService.sendSystemMessage(roomCode, '새 라운드가 시작되었습니다!');
}
```

---

## 도메인 간 데이터 흐름 예시

### 시나리오: 정답 맞추기

```
1. User가 Chat에 메시지 입력
   Chat.sendMessage(roomCode, userId, "팥빙수")

2. Chat → Answer로 정답 체크 요청
   Answer.checkAnswer(roundId, userId, "팥빙수")

3. Answer → Game에서 라운드 정보 조회
   Game.getRound(roundId) → { wordText: "팥빙수" }

4. Answer에서 정답 판별 및 점수 계산
   isCorrect = true
   score = calculateScore(order, remainingSeconds)

5. Answer → Game에 결과 반영
   Game.updatePlayerScore(userId, score)
   Game.addAnsweredOrder(roundId, userId)

6. Chat에 정답 메시지 표시
   Chat.sendSystemMessage("OOO님이 정답을 맞추셨어요!")
```

---

## 각 페이지에서 사용하는 도메인

### 로그인 페이지 (`/`)
- **User**: 닉네임 입력 및 유저 생성

### 로비 페이지 (`/lobby`)
- **User**: 현재 로그인 유저 정보
- **Room**: 방 목록, 방 생성, 방 참가

### 대기실 페이지 (`/room/[code]/waiting`)
- **User**: 참여자 목록
- **Room**: 방 정보, 설정, 게임 시작
- **Game**: 게임 상태 확인

### 게임 진행 페이지 (`/room/[code]/playing`)
- **User**: 현재 유저, drawer, guessers
- **Room**: 방 정보
- **Game**: 게임 상태, 라운드 정보, 타이머
- **Canvas**: 그리기/보기
- **Chat**: 채팅/정답 입력
- **Answer**: 정답 체크, 점수 표시
- **Word**: 제시어 선택 (drawer만)

### 게임 종료 페이지 (`/room/[code]/finished`)
- **User**: 참여자 정보
- **Room**: 방 정보
- **Game**: 최종 순위, 점수

---

## 관련 문서
- [도메인 모델](domain-model.md): 각 도메인의 상세 정의
- [프로젝트 구조](project-structure.md): 도메인별 폴더 구조
- [Use Cases](use-cases.md): 도메인 간 상호작용 시나리오
