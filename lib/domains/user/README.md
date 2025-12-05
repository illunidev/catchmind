# User Domain

## 책임 및 역할

유저의 생성, 인증, 프로필 관리를 담당하는 도메인입니다.
- 게스트 유저 생성
- 유저 정보 조회
- 유저 프로필 업데이트

---

## Use Case 매핑

이 도메인이 담당하는 Use Case:

- **UC-1.1**: 게스트로 참여하기
  - 설명: 닉네임을 입력하여 게스트 유저로 참여
  - 관련 서비스: `UserService.createGuestUser()`
  - 관련 Hook: `useUser()`

---

## 서비스 (Services)

### UserService

**파일**: `services/userService.ts`

**책임**: 유저 생성 및 관리

**메서드**:

#### `createGuestUser(nickname: string): Promise<User>`
- **설명**: 게스트 유저를 생성하고 Firebase에 저장
- **파라미터**:
  - `nickname` (string): 유저 닉네임 (1-20자)
- **반환값**: 생성된 User 객체
- **사용 예시**:
  ```typescript
  const user = await userService.createGuestUser("꼬공");
  ```

#### `getUserById(userId: string): Promise<User | null>`
- **설명**: 유저 ID로 유저 정보 조회
- **파라미터**:
  - `userId` (string): 유저 ID
- **반환값**: User 객체 또는 null
- **사용 예시**:
  ```typescript
  const user = await userService.getUserById("user_001");
  ```

#### `updateProfile(userId: string, data: Partial<User>): Promise<void>`
- **설명**: 유저 프로필 업데이트
- **파라미터**:
  - `userId` (string): 유저 ID
  - `data` (Partial<User>): 업데이트할 데이터
- **반환값**: void
- **사용 예시**:
  ```typescript
  await userService.updateProfile("user_001", { nickname: "새닉네임" });
  ```

---

## Hooks

### `useUser()`

**파일**: `hooks/useUser.ts`

**설명**: 현재 로그인한 유저 정보 관리

**반환값**:
```typescript
{
  user: User | null;
  loading: boolean;
  error: Error | null;
  createUser: (nickname: string) => Promise<void>;
  logout: () => void;
}
```

**사용 예시**:
```typescript
const { user, loading, createUser, logout } = useUser();

const handleLogin = async () => {
  await createUser("꼬공");
};

useEffect(() => {
  if (user) {
    console.log("로그인됨:", user.nickname);
  }
}, [user]);
```

---

## 타입 정의

### User

**파일**: `types.ts`

```typescript
export interface User {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: number;
  lastActive?: number;
}
```

**설명**: 유저 기본 정보

### CreateUserInput

```typescript
export interface CreateUserInput {
  nickname: string;
  avatarUrl?: string;
}
```

**설명**: 유저 생성 시 입력 데이터

---

## Firebase 경로

이 도메인이 사용하는 Firebase Realtime Database 경로:

- `/users/{userId}` - 유저 기본 정보 저장

자세한 내용은 [firebase-database-structure.md](../../../firebase-database-structure.md) 참조

---

## 의존성

### 외부 라이브러리

- `firebase/database`: Firebase Realtime Database
- `@/lib/firebase/database`: Database 헬퍼 함수
- `@/lib/utils/validation`: 닉네임 검증
- `@/lib/utils/helpers`: ID 생성

---

## 주의사항

- 닉네임은 1-20자 사이여야 함
- 게스트 유저는 별도 인증 없이 생성됨
- 로컬 스토리지에 유저 정보 저장 (세션 유지)

---

## 변경 이력

| 날짜 | 변경 내용 | 관련 UC |
|------|----------|---------|
| 2025-12-05 | 초기 생성 | UC-1.1 |

---

*이 문서는 도메인 변경사항을 반영하여 자동으로 업데이트됩니다.*
