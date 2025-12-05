
# 캐치마인드 웹 게임 기획서

## 1. 프로젝트 개요

### 1.1 서비스 이름 (가칭)
- **CatchMind Web (캐치마인드 웹)**

### 1.2 목적
- 최대 6명이 동시에 접속하여 **그림 퀴즈(캐치마인드)**를 실시간으로 즐길 수 있는 웹 게임.
- 별도 앱 설치 없이 **브라우저(PC/모바일)**에서 바로 이용 가능.

### 1.3 주요 특징
- 실시간 그림 싱크, 채팅 정답 매칭
- 2~6인까지 참여 가능한 방(room) 구조
- 인원 수에 따른 라운드 수 자동 조절 (2~3명: 1인 2회 / 4~6명: 1인 1회)
- 관리자 봇(System Bot)이 게임 흐름을 안내

---

## 2. 요구사항 정리

### 2.1 기능 요구사항

1. **플랫폼**
   - 웹 브라우저(PC/모바일)에서 접속

2. **방/인원**
   - 최대 6명까지 참여 가능
   - 최소 2명 이상일 때 게임 시작 가능
   - 방장은 설정 변경 및 게임 시작/재시작 권한 보유

3. **관리자 봇 진행**
   - 채팅방에 BOT 계정이 존재
   - 예시 메시지
     - `보미쌤: 이번 라운드가 종료되었어요! 정답은: 팔빙수`
     - `보미쌤: OOO님, 그림을 그려주세요`
     - `보미쌤: 힌트1: 4글자`
   - 라운드 시작/종료/힌트/점수 알림 등 시스템 메시지 담당

4. **점수 룰**
   - 상대방이 그린 그림을 **먼저 맞춘 순서대로 높은 점수** 획득
   - 같은 라운드에서 여러 명이 맞출 수 있음
   - 게임 종료 후 누적 점수 기준으로 최종 순위 산정

5. **라운드 수**
   - 참여 인원 2~3명: 한 사람당 그림 2개씩 → **총 라운드 = 인원수 × 2**
   - 참여 인원 4~6명: 한 사람당 그림 1개씩 → **총 라운드 = 인원수 × 1**
   - 모든 라운드가 끝나면 게임 종료

6. **게임 종료 후**
   - 최종 점수 순위 표시
   - 버튼 2개
     - **나가기**: 로비/홈 화면으로
     - **한판 더하기**: 동일 방에서 새 게임 시작(방장이 누름)

7. **UI 구성**
   - **우상단 메뉴**
     - 게임 방법 설명
     - 볼륨 설정
     - 나가기
   - **상단**
     - 라운드 제한 시간 표시 (60초 카운트다운)
     - 상단 중앙에 제시어/힌트 표시
   - **좌상단 메뉴 버튼**
     - 참여자 리스트
     - 방장인 경우: 게임 인원, 카테고리, 난이도 등 설정 변경 화면
   - **하단 유저 썸네일**
     - 유저 썸네일(아바타)
     - 닉네임
     - 현재 점수
     - 상태 텍스트(“그리는 중”, “정답!”, “대기중” 등)
     - 가장 최근 타이핑한 채팅 내용(작게)
   - **채팅 입력**
     - 유저가 타이핑한 글은 실시간으로 게임 정답과 매칭
     - 정답과 일치 시 해당 라운드 점수 획득

8. **정답 매칭**
   - 채팅 메시지가 서버로 도착하는 즉시
   - 현재 라운드의 정답 단어와 비교
   - 일치 시:
     - 해당 유저를 정답 처리(중복 정답 방지)
     - 순서 기록 및 점수 계산
     - 봇이 시스템 메시지로 안내

9. **게임 종료 시 점수 정렬**
   - 점수를 가장 많이 받은 순으로 랭킹 리스트 출력
   - 동일 점수일 경우:
     - 라운드별 평균 정답 순위 등 tie-breaker 규칙 (단순히 닉네임 가나다 순으로 처리해도 무방)

---

### 2.2 비기능 요구사항

- **반응형 UI** (모바일 우선, PC 대응)
- 실시간 동기화 지연 < 200ms (국내 기준)
- 6인 동시 접속 기준 안정적인 성능
- 욕설 필터(기본적인 금칙어 처리)
- 재접속 시 현재 라운드/그림/점수 복구

---

## 3. 전체 아키텍처

### 3.1 구조 개요

- **Frontend**
  - SPA (Single Page Application)
  - 실시간 통신 클라이언트
- **Backend**
  - REST API (회원/방/기록 조회 등)
  - 실시간 통신 서버 (게임 실시간 통신)
- **Database**
  - 실시간 데이터베이스
  - 세션/룸 상태 관리

**텍스트 아키텍처 도식**

> Client(브라우저)
> →(HTTPS)→ REST API 서버 → Database
> →(실시간 통신)→ 게임 서버 → 실시간 데이터베이스

---

## 4. 도메인 모델 & 데이터 구조

### 4.1 주요 엔티티

1. **User(유저)**
2. **Room(방)**
3. **RoomPlayer(방-유저 관계)**
4. **Game(한 번의 게임 세션)**
5. **Round(라운드 단위)**
6. **Word(제시어)**
7. **ChatMessage(채팅)**
8. **Stroke(그림 스트로크 – 필요 시 저장)**
9. **ScoreEvent(점수 로그)**

### 4.2 데이터 구조 예시

#### 4.2.1 users
- id: 고유 식별자
- nickname: 닉네임 (최대 20자)
- avatar_url: 아바타 이미지 URL
- created_at: 생성 시간

#### 4.2.2 rooms
- id: 고유 식별자
- code: 방 코드 (8자, 고유)
- title: 방 제목 (최대 50자)
- host_user_id: 방장 유저 ID
- max_players: 최대 인원 (기본 6명)
- status: 상태 ('waiting', 'playing', 'finished')
- created_at: 생성 시간

#### 4.2.3 room_players
- room_id: 방 ID
- user_id: 유저 ID
- joined_at: 참가 시간

#### 4.2.4 games
- id: 고유 식별자
- room_id: 방 ID
- started_at: 시작 시간
- ended_at: 종료 시간
- total_rounds: 총 라운드 수
- status: 상태 ('playing', 'finished')

#### 4.2.5 rounds
- id: 고유 식별자
- game_id: 게임 ID
- round_index: 라운드 번호
- drawer_user_id: 그리는 사람 ID
- word_id: 제시어 ID
- started_at: 시작 시간
- ended_at: 종료 시간
- status: 상태 ('scheduled', 'playing', 'finished')

#### 4.2.6 words
- id: 고유 식별자
- text: 제시어 텍스트 (최대 50자)
- category: 카테고리 (최대 30자)
- difficulty: 난이도 (10자)
- length: 글자 수

#### 4.2.7 round_answers
- id: 고유 식별자
- round_id: 라운드 ID
- user_id: 유저 ID
- answer_text: 답변 텍스트
- is_correct: 정답 여부
- order_index: 정답 순서
- score_gain: 획득 점수
- answered_at: 답변 시간

#### 4.2.8 chat_messages
- id: 고유 식별자
- room_id: 방 ID
- user_id: 유저 ID (nullable, 시스템 메시지)
- type: 메시지 타입 ('user', 'system')
- content: 내용
- created_at: 생성 시간

#### 4.2.9 strokes (선택)
- id: 고유 식별자
- round_id: 라운드 ID
- drawer_id: 그린 사람 ID
- stroke_data: 스트로크 데이터 (JSON)
- created_at: 생성 시간

---

### 4.3 인메모리 상태 구조 (실시간)

```ts
type PlayerState = {
  id: string;
  userId: number;
  nickname: string;
  avatarUrl?: string;
  score: number;
  status: "idle" | "drawing" | "guessing" | "answered" | "choosing";
  lastChat?: string;
  isHost: boolean;
};

type GameState = {
  phase: "lobby" | "choosing" | "drawing" | "roundEnd" | "gameEnd";
  roundIndex: number;
  totalRounds: number;
  drawerUserId: number;
  wordForDrawer?: string;
  hintForGuessers?: string;
  remainingSeconds: number;
  answeredOrder: number[];
};

type RoomState = {
  roomId: number;
  code: string;
  hostUserId: number;
  players: PlayerState[];
  settings: {
    maxPlayers: number;
    category: string;
    difficulty: "easy" | "normal" | "hard";
  };
  game?: GameState;
};
```

---

## 5. 백엔드 설계

### 5.1 REST API 요약

#### 5.1.1 유저

- `POST /api/users/guest`
  - body: `{ nickname }`
  - response: `{ userId, nickname, avatarUrl, token }`

#### 5.1.2 룸

- `POST /api/rooms`
  - body: `{ title, maxPlayers, category, difficulty }`
  - response: `{ roomId, code }`

- `POST /api/rooms/join`
  - body: `{ code }`
  - response: `{ room, players }`

- `GET /api/rooms/:roomId`
  - 룸 정보 조회

#### 5.1.3 게임 기록

- `GET /api/games/:gameId`
- `GET /api/users/:userId/history`

(MVP에서는 생략 가능)

---

### 5.2 실시간 통신 이벤트 상세

#### 5.2.1 연결 및 룸 입장

- `joinRoom` (Client → Server)

```json
{ "roomCode": "KF652739", "token": "JWT..." }
```

- `roomState` (Server → Client)

```json
{
  "room": {
    "roomId": 1,
    "code": "KF652739",
    "hostUserId": 10,
    "players": [],
    "settings": { "maxPlayers": 6, "category": "all", "difficulty": "normal" },
    "game": null
  }
}
```

#### 5.2.2 방 설정 변경

- `updateSettings` (Client → Server, Host only)

```json
{ "maxPlayers": 6, "category": "food", "difficulty": "easy" }
```

- 변경 후 `roomState` 브로드캐스트

#### 5.2.3 게임 시작

- `startGame` (Client → Server, Host only)
- 서버:
  - 인원 수 검증, totalRounds 계산, drawer 순서 정렬
  - GameState 초기화 및 `gameStarted` 브로드캐스트
  - 첫 drawer에게 `round/wordChoices` 전송

#### 5.2.4 제시어 선택 단계

- `round/wordChoices` (Server → Drawer only)

```json
{ "choices": ["팥빙수", "고로케", "풍듀", "스피드컵게임"] }
```

- `round/chooseWord` (Client → Server, Drawer only)

```json
{ "word": "팥빙수" }
```

- 서버:
  - wordId 저장, hint 생성, phase=`drawing`으로 변경, 타이머 시작
  - `round/start` 브로드캐스트

```json
{
  "roundIndex": 0,
  "drawerUserId": 12,
  "hintForGuessers": "3글자",
  "remainingSeconds": 60
}
```

#### 5.2.5 그림 그리기

- `draw/stroke` (Client → Server, Drawer only)

```json
{
  "roundId": 3,
  "points": [{ "x": 10, "y": 20 }],
  "color": "#000000",
  "size": 4,
  "tool": "pen"
}
```

- 동일 이벤트로 전체에 브로드캐스트

#### 5.2.6 채팅/정답

- `chat/message` (Client → Server)

```json
{ "text": "팥빙수" }
```

- 서버:
  - normalize 후 정답 비교
  - 오답이면 `chat/broadcast`만
  - 정답이면 answeredOrder 등록, 점수 계산, `round/answered` 및 BOT 시스템 메시지 전송

- `round/answered` (Server → All)

```json
{
  "userId": 10,
  "order": 0,
  "scoreGain": 13,
  "totalScore": 27
}
```

#### 5.2.7 타이머 브로드캐스트

- `timer/update` (Server → All)

```json
{ "remainingSeconds": 42 }
```

#### 5.2.8 라운드 종료

- `round/end` (Server → All)

```json
{
  "roundIndex": 0,
  "answer": "팥빙수",
  "players": [
    { "userId": 10, "scoreGain": 13, "totalScore": 27 }
  ]
}
```

#### 5.2.9 게임 종료

- `game/end` (Server → All)

```json
{
  "ranking": [
    { "userId": 10, "nickname": "꼬공", "score": 55 },
    { "userId": 11, "nickname": "다조이", "score": 43 }
  ]
}
```

---

## 6. 프론트엔드 설계

### 6.1 라우팅

- `/` : 닉네임 입력 / 방 코드 입력 / 빠른 시작
- `/room/:code` : 룸 대기 및 게임 화면

### 6.2 컴포넌트 구조

- App
  - LobbyPage
  - GamePage
- GamePage
  - TopBar
  - CanvasBoard
  - ChatPanel
  - UserStrip
  - SideMenu
  - SettingsMenu
  - WordChoiceModal
  - GameOverModal
  - HowToModal
  - SoundSettingModal

### 6.3 주요 컴포넌트 역할

- **TopBar**: 남은 시간/라운드, 제시어/힌트, 우측 옵션 버튼 표시
- **CanvasBoard**: Drawer 드로잉, Guesser read-only
- **ChatPanel**: 채팅 로그 + 입력창
- **UserStrip**: 참가자 카드(아바타/닉네임/점수/상태/마지막 채팅)
- **WordChoiceModal**: Drawer 전용 제시어 선택
- **GameOverModal**: 최종 순위, 나가기/한판 더하기

---

## 7. 게임 상태(State Machine) 설계

### 7.1 Room.status

- `waiting`
- `playing`
- `finished`

### 7.2 GameState.phase

1. `lobby`
2. `choosing`
3. `drawing`
4. `roundEnd`
5. `gameEnd`

### 7.3 상태 전이

- `lobby` → (startGame) → `choosing`
- `choosing` → (단어 선택/시간초과) → `drawing`
- `drawing` → (타이머 종료/모두 정답) → `roundEnd`
- `roundEnd` → (다음 라운드 존재) → `choosing`
- `roundEnd` → (마지막 라운드) → `gameEnd`
- `gameEnd` → (한판 더하기) → `choosing`

---

## 8. 점수/랭킹 로직

### 8.1 정답 순서 기반 점수

- 기본 점수
  - 1등: 10점
  - 2등: 7점
  - 3등: 5점
  - 이후: 3점

- 시간 보너스

```ts
timeBonus = Math.floor(remainingSeconds / 6);
```

- 화가 점수
  - 최소 1인 이상 정답: +5점
  - 모두 정답: 추가 +3점

- 최종 점수

```ts
scoreGain = baseScore(order) + timeBonus;
```

### 8.2 랭킹 계산

- 최종 누적 score 기준 내림차순
- 동점 시 1등 횟수 → userId 오름차순

---

## 9. 정답 매칭 규칙

### 9.1 Normalization

- `trim()`으로 앞뒤 공백 제거
- 필요시 중간 공백 제거
- 영문 대소문자 통일
- 한글은 그대로 비교

### 9.2 매칭 규칙

- 완전 일치해야 정답
- 부분 일치는 오답

---

## 10. 텍스트 도식화 – 주요 플로우

### 10.1 게임 시작 플로우

1. 방장: “게임 시작” 클릭
2. `startGame` 이벤트
3. 서버: GameState 초기화, 첫 drawer 지정, `round/wordChoices` 전송
4. Drawer: 단어 선택 → `round/chooseWord`
5. 서버: `round/start` 방송, 타이머 시작

### 10.2 정답 입력 플로우

1. 플레이어: `chat/message`
2. 서버: 정답 비교 및 점수 계산
3. 정답 시 `round/answered` + BOT 메시지

### 10.3 라운드 종료 → 다음 라운드

1. 타이머 종료 or 모두 정답
2. `round/end` + BOT “정답은 OOO”
3. 다음 라운드 존재 → `choosing`, 없으면 `game/end`

---

## 11. 비기능 및 운영 고려사항

### 11.1 보안

- JWT 인증
- WebSocket 토큰 검증
- 욕설/비속어 필터링

### 11.2 안정성

- Drawer 이탈 시 현재 라운드 종료 후 다음 drawer
- Guesser 이탈은 인원만 감소
- 재접속 시 RoomState 복구

### 11.3 모니터링

- 게임 시작/종료 로그
- 라운드별 평균 정답 시간
- 유저별 평균 점수/1등 횟수

---

## 12. 개발 로드맵

### 1단계 – MVP

- 기본 UI/UX, 실시간 게임 진행, 결과 모달

### 2단계 – UX 개선

- 반응형/애니메이션/효과음, 재접속 복구

### 3단계 – 기록 및 소셜

- 게임 기록/통계, 친구 초대/추가
