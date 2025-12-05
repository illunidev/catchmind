# Room Domain

## 책임 및 역할

게임 방의 생성, 참가, 설정 관리를 담당하는 도메인입니다.
- 방 생성 및 코드 생성
- 방 참가/나가기
- 방 설정 변경 (방장)
- 플레이어 목록 관리

---

## Use Case 매핑

이 도메인이 담당하는 Use Case:

- **UC-2.1**: 방 생성하기
  - 설명: 방을 생성하고 고유 코드 발급
  - 관련 서비스: `RoomService.createRoom()`
  - 관련 Hook: `useRoom()`

- **UC-2.2**: 방 참가하기
  - 설명: 방 코드로 방에 참가
  - 관련 서비스: `RoomService.joinRoom()`
  - 관련 Hook: `useRoom()`

- **UC-2.3**: 방 설정 변경하기
  - 설명: 방장이 방 설정 변경
  - 관련 서비스: `RoomService.updateSettings()`
  - 관련 Hook: `useRoom()`

- **UC-2.4**: 방 나가기
  - 설명: 방에서 나가고, 방장이면 권한 이전
  - 관련 서비스: `RoomService.leaveRoom()`
  - 관련 Hook: `useRoom()`

---

## 서비스 (Services)

### RoomService

**파일**: `services/roomService.ts`

**책임**: 방 생성 및 관리, 플레이어 참가/퇴장

**메서드**:

#### `createRoom(input: CreateRoomInput): Promise<Room>`
- **설명**: 새 방을 생성하고 방장을 자동 참가시킴
- **파라미터**:
  - `input.title` (string): 방 제목
  - `input.hostUserId` (string): 방장 유저 ID
  - `input.settings` (RoomSettings): 방 설정
- **반환값**: 생성된 Room 객체
- **사용 예시**:
  ```typescript
  const room = await roomService.createRoom({
    title: "즐거운 그림 방",
    hostUserId: "user_001",
    settings: {
      maxPlayers: 6,
      category: "all",
      difficulty: "normal"
    }
  });
  ```

#### `joinRoom(userId: string, roomCode: string): Promise<void>`
- **설명**: 방 코드로 방에 참가
- **파라미터**:
  - `userId` (string): 참가할 유저 ID
  - `roomCode` (string): 방 코드
- **반환값**: void
- **검증**: 방 존재, 방 상태 확인, 인원 제한, 중복 참가 방지

#### `leaveRoom(userId: string, roomId: string): Promise<void>`
- **설명**: 방에서 나가기, 방장이면 권한 이전
- **파라미터**:
  - `userId` (string): 유저 ID
  - `roomId` (string): 방 ID

#### `updateSettings(roomId: string, settings: UpdateRoomSettingsInput): Promise<void>`
- **설명**: 방 설정 업데이트 (방장만)
- **파라미터**:
  - `roomId` (string): 방 ID
  - `settings` (UpdateRoomSettingsInput): 변경할 설정

---

## Hooks

### `useRoom(roomId: string)`

**파일**: `hooks/useRoom.ts`

**설명**: 특정 방의 실시간 상태 관리

**파라미터**:
- `roomId` (string): 방 ID

**반환값**:
```typescript
{
  room: Room | null;
  players: Player[];
  loading: boolean;
  error: Error | null;
  isHost: (userId: string) => boolean;
  updateSettings: (settings: UpdateRoomSettingsInput) => Promise<void>;
}
```

**사용 예시**:
```typescript
const { room, players, isHost, updateSettings } = useRoom(roomId);

if (isHost(currentUserId)) {
  await updateSettings({ maxPlayers: 4 });
}
```

---

## 타입 정의

### Room

```typescript
export interface Room {
  id: string;
  code: string;
  title: string;
  hostUserId: string;
  currentPlayers: number;
  maxPlayers: number;
  status: RoomStatus;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
}
```

### Player

```typescript
export interface Player {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  score: number;
  status: PlayerStatus;
  lastChat?: string;
  isHost: boolean;
  joinedAt: number;
  isOnline: boolean;
  lastSeen: number;
}
```

---

## Firebase 경로

- `/rooms/{roomId}` - 방 메타데이터 (리스트용)
- `/roomDetails/{roomId}/info` - 방 상세 정보
- `/roomDetails/{roomId}/players/{userId}` - 플레이어 정보

자세한 내용은 [firebase-database-structure.md](../../../firebase-database-structure.md) 참조

---

## 의존성

### 다른 도메인 의존성

- **User**: 유저 정보 조회 (getUserById)

### 외부 라이브러리

- `firebase/database`: Firebase Realtime Database
- `@/lib/firebase/database`: Database 헬퍼 함수
- `@/lib/firebase/presence`: 접속 상태 관리
- `@/lib/utils/helpers`: 방 코드 생성
- `@/lib/utils/validation`: 방 코드/제목 검증

---

## 주의사항

- 방 코드는 8자 대문자+숫자 (예: KF652739)
- 방장이 나가면 다음 참가자가 자동으로 방장됨
- 방에 아무도 없으면 자동 삭제
- 게임 중인 방에는 참가 불가

---

## 변경 이력

| 날짜 | 변경 내용 | 관련 UC |
|------|----------|---------|
| 2025-12-05 | 초기 생성 | UC-2.1, UC-2.2, UC-2.3, UC-2.4 |

---

*이 문서는 도메인 변경사항을 반영하여 자동으로 업데이트됩니다.*
