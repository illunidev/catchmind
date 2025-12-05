# Catchmind Domain Model (도메인 모델)

## 1. 도메인 개요

Catchmind는 실시간 그림 맞추기 게임으로, 다음과 같은 핵심 도메인으로 구성됩니다:
- **사용자 관리**: 게스트 유저의 생성 및 관리
- **방 관리**: 게임 방의 생성, 참가, 설정
- **게임 진행**: 라운드 기반 게임 세션 관리
- **그림 그리기**: 실시간 캔버스 스트로크 동기화
- **정답 처리**: 채팅 기반 정답 매칭 및 점수 계산

---

## 2. 핵심 엔티티 (Core Entities)

### 2.1 User (유저)

**책임**: 게임 참여자의 정보를 나타냄

**속성**:
- `id`: 고유 식별자
- `nickname`: 닉네임 (최대 20자)
- `avatarUrl`: 아바타 이미지 URL (선택)
- `createdAt`: 생성 시간

**비즈니스 규칙**:
- 닉네임은 필수이며 1-20자 사이여야 함
- 게스트 유저로 간단하게 참여 가능
- 동일 세션 내에서 닉네임 중복 가능

**관계**:
- Room과 N:M 관계 (RoomPlayer를 통해)
- Game의 참여자
- Round에서 drawer 또는 guesser 역할

---

### 2.2 Room (방)

**책임**: 게임이 진행되는 공간. 플레이어들이 모이는 대기실이자 게임장

**속성**:
- `id`: 고유 식별자
- `code`: 방 코드 (8자, 고유) - 예: "KF652739"
- `title`: 방 제목 (최대 50자)
- `hostUserId`: 방장 유저 ID
- `maxPlayers`: 최대 인원 (2-6명, 기본 6명)
- `status`: 상태 (waiting, playing, finished)
- `settings`: 게임 설정
  - `category`: 제시어 카테고리 (all, food, animal, object, action)
  - `difficulty`: 난이도 (easy, normal, hard)
- `createdAt`: 생성 시간

**비즈니스 규칙**:
- 방 코드는 자동 생성되며 고유해야 함
- 최소 2명 이상일 때만 게임 시작 가능
- 방장만 게임 설정 변경 및 시작 권한 보유
- 방장이 나가면 다음 참가자가 자동으로 방장이 됨
- 최대 인원 초과 시 참가 불가

**상태 전이**:
```
waiting (대기) → [게임 시작] → playing (진행 중)
playing → [게임 종료] → finished (종료됨)
finished → [한판 더하기] → playing
```

**관계**:
- User와 N:M 관계 (RoomPlayer를 통해)
- Game과 1:N 관계 (하나의 방에서 여러 게임 가능)

---

### 2.3 RoomPlayer (방-유저 관계)

**책임**: 특정 방에 참여한 유저의 상태 및 정보

**속성**:
- `roomId`: 방 ID
- `userId`: 유저 ID
- `joinedAt`: 참가 시간
- `score`: 현재 게임의 누적 점수
- `status`: 플레이어 상태
  - `idle`: 대기 중
  - `choosing`: 제시어 선택 중
  - `drawing`: 그리는 중
  - `guessing`: 맞추는 중
  - `answered`: 정답을 맞춤
- `lastChat`: 마지막 채팅 내용
- `isHost`: 방장 여부

**비즈니스 규칙**:
- 한 방에 동일 유저가 중복 참가 불가
- 게임 시작 시 모든 플레이어의 점수는 0으로 초기화
- 플레이어가 나가면 RoomPlayer 관계 삭제

**관계**:
- Room과 User를 연결하는 중간 엔티티

---

### 2.4 Game (게임 세션)

**책임**: 한 번의 완전한 게임 진행 (시작부터 종료까지)

**속성**:
- `id`: 고유 식별자
- `roomId`: 방 ID
- `startedAt`: 시작 시간
- `endedAt`: 종료 시간
- `totalRounds`: 총 라운드 수
- `currentRoundIndex`: 현재 라운드 번호
- `status`: 상태 (playing, finished)
- `phase`: 게임 단계
  - `lobby`: 로비 (대기)
  - `choosing`: 제시어 선택
  - `drawing`: 그리기
  - `roundEnd`: 라운드 종료
  - `gameEnd`: 게임 종료

**비즈니스 규칙**:
- 총 라운드 수는 참여 인원에 따라 자동 계산
  - 2-3명: `인원 × 2`
  - 4-6명: `인원 × 1`
- 모든 라운드가 끝나면 게임 종료
- Drawer 순서는 게임 시작 시 무작위 또는 순차적으로 결정

**상태 전이**:
```
lobby → [게임 시작] → choosing
choosing → [단어 선택] → drawing
drawing → [타이머 종료/모두 정답] → roundEnd
roundEnd → [다음 라운드 존재] → choosing
roundEnd → [마지막 라운드] → gameEnd
```

**관계**:
- Room과 N:1 관계
- Round와 1:N 관계

---

### 2.5 Round (라운드)

**책임**: 한 명의 drawer가 그림을 그리고 다른 플레이어들이 맞추는 하나의 턴

**속성**:
- `id`: 고유 식별자
- `gameId`: 게임 ID
- `roundIndex`: 라운드 번호 (0부터 시작)
- `drawerUserId`: 그리는 사람 ID
- `wordId`: 제시어 ID
- `wordText`: 제시어 텍스트 (비정규화)
- `hintText`: 힌트 텍스트 (예: "3글자")
- `startedAt`: 시작 시간
- `endedAt`: 종료 시간
- `remainingSeconds`: 남은 시간 (60초)
- `status`: 상태 (scheduled, choosing, playing, finished)
- `answeredOrder`: 정답 맞춘 순서 (userId 배열)

**비즈니스 규칙**:
- 제한 시간은 60초
- Drawer는 정답을 입력할 수 없음
- 모든 Guesser가 정답을 맞추면 조기 종료
- 타이머가 끝나면 자동 종료
- 정답은 한 번만 인정 (중복 불가)

**상태 전이**:
```
scheduled (예정) → [Drawer 지정] → choosing (선택 중)
choosing → [단어 선택] → playing (진행 중)
playing → [종료 조건] → finished (종료)
```

**관계**:
- Game과 N:1 관계
- Word와 N:1 관계
- User와 N:1 관계 (drawer)
- RoundAnswer와 1:N 관계

---

### 2.6 Word (제시어)

**책임**: 게임에서 사용되는 제시어 단어

**속성**:
- `id`: 고유 식별자
- `text`: 제시어 텍스트 (최대 50자)
- `category`: 카테고리
  - `all`: 전체
  - `food`: 음식
  - `animal`: 동물
  - `object`: 사물
  - `action`: 행동
- `difficulty`: 난이도 (easy, normal, hard)
- `length`: 글자 수

**비즈니스 규칙**:
- 카테고리와 난이도에 맞는 단어만 선택지로 제공
- 한 라운드에 4개의 단어 선택지 제공
- 동일 게임 내에서 중복 단어 사용 가능 (다른 라운드)

**관계**:
- Round와 1:N 관계

---

### 2.7 RoundAnswer (라운드 정답)

**책임**: 특정 라운드에서 플레이어가 제출한 답변 기록

**속성**:
- `id`: 고유 식별자
- `roundId`: 라운드 ID
- `userId`: 유저 ID
- `answerText`: 답변 텍스트
- `isCorrect`: 정답 여부
- `orderIndex`: 정답 순서 (0부터 시작, 1등=0)
- `scoreGain`: 획득 점수
- `answeredAt`: 답변 시간

**비즈니스 규칙**:
- 정답 순서에 따라 점수 차등 부여
  - 1등: 10점
  - 2등: 7점
  - 3등: 5점
  - 4등 이후: 3점
- 시간 보너스: `Math.floor(remainingSeconds / 6)`
- 최종 점수: `baseScore + timeBonus`
- 오답도 기록 가능 (통계용)

**관계**:
- Round와 N:1 관계
- User와 N:1 관계

---

### 2.8 ChatMessage (채팅 메시지)

**책임**: 방에서 주고받는 메시지 (유저 채팅 + 시스템 메시지)

**속성**:
- `id`: 고유 식별자
- `roomId`: 방 ID
- `userId`: 유저 ID (시스템 메시지는 null)
- `type`: 메시지 타입
  - `user`: 유저 메시지
  - `system`: 시스템 메시지 (봇)
  - `answer`: 정답 메시지 (다른 유저에게 "정답!"으로 표시)
- `content`: 메시지 내용
- `createdAt`: 생성 시간

**비즈니스 규칙**:
- 유저 채팅은 실시간으로 정답 매칭
- 정답 시 다른 플레이어에게는 "정답!"으로 표시
- 시스템 메시지는 봇(보미쌤) 이름으로 표시
- 욕설 필터링 적용

**시스템 메시지 예시**:
- "보미쌤: OOO님, 그림을 그려주세요"
- "보미쌤: 힌트: 3글자"
- "보미쌤: 꼬공님이 정답을 맞추셨어요!"
- "보미쌤: 이번 라운드가 종료되었어요! 정답은: 팥빙수"

**관계**:
- Room과 N:1 관계
- User와 N:1 관계 (nullable)

---

### 2.9 Stroke (그림 스트로크) - 선택적

**책임**: 캔버스에 그려진 선/도형 데이터 (리플레이/저장용)

**속성**:
- `id`: 고유 식별자
- `roundId`: 라운드 ID
- `drawerId`: 그린 사람 ID
- `strokeData`: 스트로크 데이터 (JSON)
  - `points`: 좌표 배열 `[{x, y}]`
  - `color`: 색상 (hex)
  - `size`: 선 두께
  - `tool`: 도구 타입 (pen, eraser)
- `createdAt`: 생성 시간

**비즈니스 규칙**:
- 실시간 게임에서는 메모리에만 유지
- 게임 기록/리플레이 기능 시 DB 저장
- 스트로크 데이터는 throttling 처리 (너무 빈번한 업데이트 방지)

**관계**:
- Round와 N:1 관계
- User와 N:1 관계 (drawer)

---

## 3. 값 객체 (Value Objects)

### 3.1 RoomSettings (방 설정)

```typescript
{
  maxPlayers: number;      // 2-6
  category: string;        // all, food, animal, object, action
  difficulty: string;      // easy, normal, hard
}
```

### 3.2 PlayerState (플레이어 상태)

```typescript
{
  userId: number;
  nickname: string;
  avatarUrl?: string;
  score: number;
  status: string;          // idle, drawing, guessing, answered, choosing
  lastChat?: string;
  isHost: boolean;
}
```

### 3.3 GameState (게임 상태)

```typescript
{
  phase: string;           // lobby, choosing, drawing, roundEnd, gameEnd
  roundIndex: number;
  totalRounds: number;
  drawerUserId: number;
  wordForDrawer?: string;
  hintForGuessers?: string;
  remainingSeconds: number;
  answeredOrder: number[];
}
```

### 3.4 StrokeData (스트로크 데이터)

```typescript
{
  points: Array<{x: number, y: number}>;
  color: string;           // hex color
  size: number;            // 1-20
  tool: string;            // pen, eraser
}
```

---

## 4. 도메인 서비스 (Domain Services)

### 4.1 RoomService

**책임**: 방 생성, 참가, 설정 관리

**메서드**:
- `createRoom(hostUserId, title, settings)`: 방 생성 및 코드 생성
- `joinRoom(userId, roomCode)`: 방 참가
- `leaveRoom(userId, roomId)`: 방 나가기
- `updateSettings(roomId, settings)`: 설정 변경 (방장만)
- `transferHost(roomId, newHostUserId)`: 방장 권한 이전

---

### 4.2 GameService

**책임**: 게임 세션 생성, 라운드 관리, 게임 진행 제어

**메서드**:
- `startGame(roomId)`: 게임 시작
  - 총 라운드 수 계산
  - Drawer 순서 결정
  - 첫 라운드 시작
- `startRound(gameId, roundIndex)`: 라운드 시작
  - Drawer 지정
  - 제시어 선택지 생성 (4개)
- `chooseWord(roundId, wordId)`: 제시어 선택
  - 힌트 생성 (글자 수)
  - 타이머 시작 (60초)
- `endRound(roundId)`: 라운드 종료
  - Drawer 점수 계산
  - 다음 라운드 존재 여부 확인
- `endGame(gameId)`: 게임 종료
  - 최종 순위 계산
  - 게임 상태 변경

---

### 4.3 AnswerService

**책임**: 정답 매칭, 점수 계산

**메서드**:
- `checkAnswer(roundId, userId, answerText)`: 정답 확인
  - Normalization (trim, 공백 제거, 소문자 변환)
  - 정답 비교
  - 중복 정답 방지
- `calculateScore(orderIndex, remainingSeconds)`: 점수 계산
  - 기본 점수 (순서별)
  - 시간 보너스
- `calculateDrawerScore(roundId)`: Drawer 점수 계산
  - 최소 1명 정답: +5점
  - 모두 정답: 추가 +3점

---

### 4.4 RankingService

**책임**: 최종 순위 계산

**메서드**:
- `calculateFinalRanking(gameId)`: 최종 순위 계산
  - 누적 점수 기준 내림차순 정렬
  - 동점 처리: 1등 횟수 → userId 오름차순

---

### 4.5 WordService

**책임**: 제시어 관리 및 선택

**메서드**:
- `getWordChoices(category, difficulty, count)`: 제시어 선택지 생성
  - 카테고리와 난이도에 맞는 단어 필터링
  - 랜덤으로 4개 선택
- `generateHint(word)`: 힌트 생성
  - 기본: "O글자" (예: "3글자")
  - 추가 힌트 (선택): 첫 글자 공개 등

---

### 4.6 ChatService

**책임**: 채팅 메시지 처리, 필터링

**메서드**:
- `sendMessage(roomId, userId, content)`: 메시지 전송
  - 욕설 필터링
  - 정답 매칭 시도
- `sendSystemMessage(roomId, content)`: 시스템 메시지 전송
- `filterProfanity(text)`: 욕설 필터링

---

## 5. 도메인 이벤트 (Domain Events)

실시간 게임을 위한 이벤트 기반 아키텍처:

### 5.1 Room Events
- `PlayerJoined`: 플레이어가 방에 참가함
- `PlayerLeft`: 플레이어가 방을 나감
- `HostChanged`: 방장이 변경됨
- `SettingsUpdated`: 방 설정이 변경됨

### 5.2 Game Events
- `GameStarted`: 게임이 시작됨
- `GameEnded`: 게임이 종료됨
- `RoundStarted`: 라운드가 시작됨
- `RoundEnded`: 라운드가 종료됨
- `WordChoicesProvided`: 제시어 선택지가 제공됨
- `WordChosen`: 제시어가 선택됨

### 5.3 Drawing Events
- `StrokeDrawn`: 스트로크가 그려짐
- `CanvasCleared`: 캔버스가 지워짐

### 5.4 Answer Events
- `AnswerSubmitted`: 답변이 제출됨
- `CorrectAnswer`: 정답이 맞춰짐
- `ScoreUpdated`: 점수가 업데이트됨

### 5.5 Timer Events
- `TimerTick`: 타이머가 1초 감소함 (매초 브로드캐스트)
- `TimerExpired`: 타이머가 만료됨

### 5.6 Chat Events
- `MessageSent`: 채팅 메시지가 전송됨
- `SystemMessageSent`: 시스템 메시지가 전송됨

---

## 6. 집합 루트 (Aggregate Roots)

### 6.1 Room Aggregate
- **Root**: Room
- **Entities**: RoomPlayer
- **Invariants**:
  - 최대 인원 초과 불가
  - 최소 2명 이상일 때만 게임 시작 가능
  - 방장은 항상 존재해야 함

### 6.2 Game Aggregate
- **Root**: Game
- **Entities**: Round, RoundAnswer
- **Invariants**:
  - 모든 라운드는 순차적으로 진행
  - Drawer는 자기 차례에 정답을 입력할 수 없음
  - 한 플레이어는 한 라운드에 한 번만 정답 인정

---

## 7. 유비쿼터스 언어 (Ubiquitous Language)

프로젝트에서 사용하는 공통 용어:

- **Drawer**: 그림을 그리는 사람
- **Guesser**: 그림을 보고 맞추는 사람
- **Round**: 한 명의 Drawer가 그림을 그리는 턴
- **제시어 (Word)**: Drawer가 그려야 하는 단어
- **힌트 (Hint)**: Guesser에게 제공되는 단서 (예: "3글자")
- **스트로크 (Stroke)**: 캔버스에 그려진 한 번의 선/도형
- **정답 순서 (Answer Order)**: 정답을 맞춘 순서 (점수 계산에 사용)
- **방장 (Host)**: 방의 관리 권한을 가진 플레이어
- **봇 (Bot)**: 시스템 메시지를 전달하는 관리자 봇 (보미쌤)
- **라운드 종료 (Round End)**: 타이머 만료 또는 모두 정답 시
- **게임 종료 (Game End)**: 모든 라운드 완료 시

---

## 8. 도메인 규칙 요약

### 8.1 방 규칙
- 방 코드는 8자 고유 코드로 자동 생성
- 최소 2명, 최대 6명 참가 가능
- 방장만 설정 변경 및 게임 시작 권한 보유

### 8.2 게임 규칙
- 2-3명: 1인당 2라운드
- 4-6명: 1인당 1라운드
- 각 라운드는 60초 제한

### 8.3 점수 규칙
- 1등: 10점, 2등: 7점, 3등: 5점, 4등 이후: 3점
- 시간 보너스: `Math.floor(remainingSeconds / 6)`
- Drawer: 최소 1명 정답 시 +5점, 모두 정답 시 추가 +3점

### 8.4 정답 규칙
- 완전 일치만 정답 인정
- 부분 일치는 오답
- Normalization: trim, 공백 제거, 소문자 변환
- 한 라운드에 한 번만 정답 인정 (중복 불가)

---

*이 문서는 도메인 모델의 변경사항을 반영하여 지속적으로 업데이트됩니다.*
