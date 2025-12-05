# Game Domain

## 책임 및 역할
게임의 진행 상태, 라운드 관리, 점수 계산, 최종 순위 집계를 담당하는 도메인입니다.

## 주요 서비스

### GameService
게임 로직을 관리하는 서비스 클래스입니다.

**주요 메서드:**
- `startGame(roomCode, players)` - 게임 시작 및 드로잉 순서 설정
- `startRound(roomCode, roundNumber, drawerId, word, category)` - 라운드 시작
- `submitAnswer(roomCode, roundNumber, userId, answer, correctWord)` - 정답 제출 및 점수 계산
- `endRound(roomCode, roundNumber)` - 라운드 종료
- `endGame(roomCode)` - 게임 종료 및 최종 순위 계산
- `getGameState(roomCode)` - 게임 상태 조회
- `getRound(roomCode, roundNumber)` - 라운드 정보 조회
- `getFinalRankings(roomCode)` - 최종 순위 조회
- `resetGame(roomCode)` - 게임 데이터 초기화 (재시작용)

## 주요 Hook

### useGame
게임 상태를 실시간으로 구독하고 게임 관련 액션을 제공하는 훅입니다.

**반환 값:**
- `gameState` - 현재 게임 상태 (GameState | null)
- `currentRound` - 현재 라운드 정보 (Round | null)
- `finalRankings` - 최종 순위 (FinalRanking[] | null)
- `loading` - 로딩 상태
- `startGame(players)` - 게임 시작 함수
- `startRound(roundNumber, drawerId, word, category)` - 라운드 시작 함수
- `submitAnswer(userId, answer, correctWord)` - 정답 제출 함수
- `endRound()` - 라운드 종료 함수
- `endGame()` - 게임 종료 함수
- `resetGame()` - 게임 재시작 함수

**실시간 구독:**
- `gameStates/{roomCode}` - 게임 상태
- `rounds/{roomCode}/{roundNumber}` - 현재 라운드
- `gameResults/{roomCode}` - 최종 순위

## Use Case 매핑

이 도메인은 다음 Use Case를 담당합니다:

- **UC-3.1**: 게임 시작 - 호스트가 게임을 시작하고 드로잉 순서를 정함
- **UC-3.2**: 라운드 진행 - 각 라운드의 시작, 진행, 종료 관리
- **UC-3.3**: 정답 제출 및 점수 계산 - 플레이어의 정답 제출과 점수 계산
- **UC-3.4**: 라운드 종료 - 시간 종료 또는 모든 플레이어 정답 시 라운드 종료
- **UC-3.5**: 게임 종료 및 순위 - 모든 라운드 종료 후 최종 순위 집계

## 타입 정의

### GameState
```typescript
interface GameState {
  status: GamePhase;           // 게임 상태 (waiting, drawing, finished)
  currentRound: number;        // 현재 라운드 번호
  totalRounds: number;         // 전체 라운드 수
  drawOrder: string[];         // 드로잉 순서 (userId 배열)
  startedAt: number;           // 게임 시작 시간
}
```

### Round
```typescript
interface Round {
  roundNumber: number;         // 라운드 번호
  drawerId: string;            // 그리는 사람 ID
  word: string;                // 정답 단어
  category: string;            // 카테고리
  startTime: number;           // 시작 시간
  timeLimit: number;           // 제한 시간 (초)
  answers?: Record<string, RoundAnswer>;  // 플레이어별 정답 기록
  endTime?: number;            // 종료 시간
}
```

### FinalRanking
```typescript
interface FinalRanking {
  userId: string;              // 플레이어 ID
  totalScore: number;          // 총점
  rank: number;                // 순위
}
```

## 점수 계산 로직

### 정답자 점수
```typescript
// 빠른 정답일수록 높은 점수
score = BASE_SCORE * (1 - (elapsedTime / timeLimit) * 0.5) * ORDER_MULTIPLIER
```

- `BASE_SCORE`: 기본 점수 (1000점)
- 시간 보정: 남은 시간에 비례하여 50% 범위 내에서 보정
- `ORDER_MULTIPLIER`: 정답 순서에 따른 배율
  - 1등: 1.0
  - 2등: 0.8
  - 3등: 0.6
  - 4등 이상: 0.4

### 출제자 보너스
```typescript
drawerBonus = DRAWER_BONUS * correctAnswersCount
```

- `DRAWER_BONUS`: 정답자 1명당 100점

## 사용 예시

```typescript
import { useGame } from '@/lib/domains/game/hooks/useGame';

function GameRoom({ roomCode, players, currentUserId }) {
  const {
    gameState,
    currentRound,
    finalRankings,
    startGame,
    startRound,
    submitAnswer,
    endRound,
    endGame,
  } = useGame(roomCode);

  // 게임 시작
  const handleStartGame = async () => {
    await startGame(players);
    // 첫 라운드 시작
    await startRound(1, gameState.drawOrder[0], '사과', 'food');
  };

  // 정답 제출
  const handleSubmit = async (answer: string) => {
    if (!currentRound) return;
    const isCorrect = await submitAnswer(
      currentUserId,
      answer,
      currentRound.word
    );
    if (isCorrect) {
      console.log('정답입니다!');
    }
  };

  // 라운드 종료
  const handleEndRound = async () => {
    await endRound();
    // 다음 라운드 시작 또는 게임 종료
  };

  return (
    <div>
      <h2>Round {gameState?.currentRound} / {gameState?.totalRounds}</h2>
      {/* 게임 UI */}
    </div>
  );
}
```

## Firebase 데이터베이스 구조

```
gameStates/
  {roomCode}/
    status: "waiting" | "drawing" | "finished"
    currentRound: 1
    totalRounds: 6
    drawOrder: ["user1", "user2", ...]
    startedAt: 1234567890

rounds/
  {roomCode}/
    {roundNumber}/
      roundNumber: 1
      drawerId: "user1"
      word: "사과"
      category: "food"
      startTime: 1234567890
      timeLimit: 80
      answers:
        user2:
          answer: "사과"
          isCorrect: true
          timestamp: 1234567920
          score: 850

gameResults/
  {roomCode}/
    rankings:
      - userId: "user1"
        totalScore: 5200
        rank: 1
      - userId: "user2"
        totalScore: 4800
        rank: 2
    endedAt: 1234567890
```
