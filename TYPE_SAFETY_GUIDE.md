# Type Safety Guide

이 문서는 Catchmind 프로젝트의 타입 안전성을 유지하고 향후 타입 에러를 방지하기 위한 가이드입니다.

## 주요 타입 정의

### 1. Canvas 타입

**파일**: [types/canvas.ts](types/canvas.ts)

```typescript
export interface Stroke {
  id?: string;
  points: Point[];
  color: string;
  lineWidth: number;  // ⚠️ 'size'가 아닌 'lineWidth' 사용
  tool: ToolType;
  timestamp?: number;
}

export type ToolType = 'pen' | 'eraser';  // ⚠️ string이 아닌 union type
```

**주의사항**:
- `Stroke.lineWidth`: 항상 `lineWidth`를 사용하세요 (`size` 아님)
- `ToolType`: string이 아닌 'pen' | 'eraser' union type
- `CanvasState.strokes`: `Record<string, Stroke>` 타입 (배열이 아님)

### 2. Word 타입

**파일**: [types/word.ts](types/word.ts)

```typescript
export interface Word {
  id: string;
  text: string;        // ⚠️ 'word'가 아닌 'text' 사용
  category: Category;
  difficulty: Difficulty;
  length: number;
}

export interface WordChoice {
  id: string;
  text: string;        // ⚠️ 'word'가 아닌 'text' 사용
  // category 필드 없음!
}
```

**주의사항**:
- `Word.text`: 항상 `text`를 사용하세요 (`word` 아님)
- `WordChoice`는 `category` 필드가 없습니다

### 3. Chat 타입

**파일**: [types/chat.ts](types/chat.ts)

```typescript
export type MessageType = 'user' | 'system' | 'answer';  // ⚠️ 'chat' 아님

export interface ChatMessage {
  id: string;
  userId: string | null;
  nickname?: string;           // ⚠️ optional 필드
  type: MessageType;
  content: string;
  originalContent?: string;
  timestamp: number;
}
```

**주의사항**:
- `MessageType`: 'user', 'system', 'answer' 중 하나 ('chat' 아님)
- `nickname`은 optional 필드입니다

### 4. Game 타입

**파일**: [types/game.ts](types/game.ts)

```typescript
export interface Round {
  roundNumber: number;
  drawerId: string;
  word: string;
  startTime: number;
  timeLimit: number;
  answers?: Record<string, RoundAnswer>;  // ⚠️ 배열이 아닌 Record
  endTime?: number;
  // category 필드 없음!
}
```

**주의사항**:
- `Round.answers`: `Record<string, RoundAnswer>` 타입 (배열이 아님)
- `Round`에 `category` 필드가 없습니다

### 5. Answer 타입

**파일**: [types/answer.ts](types/answer.ts)

```typescript
export interface AnswerCheckResult {
  isCorrect: boolean;
  orderIndex?: number;
  scoreGain?: number;
  similarity?: number;   // ⚠️ 유사도 체크용
  hint?: string;         // ⚠️ 힌트 메시지용
}
```

**주의사항**:
- `similarity`와 `hint`는 optional 필드입니다
- `scoreGain`도 optional입니다 (정답이 아닐 때는 없을 수 있음)

### 6. Room 타입

**파일**: [types/room.ts](types/room.ts)

```typescript
export type PlayerStatus =
  | 'waiting'
  | 'drawing'
  | 'guessing'
  | 'answered';  // ⚠️ 'ready' 아님
```

**주의사항**:
- `PlayerStatus`에 'ready' 값은 없습니다
- 정답을 맞춘 상태는 'answered'를 사용하세요

## 타입 에러 방지 체크리스트

### 빌드 전 체크사항

1. **타입 검사 실행**
   ```bash
   npm run build
   ```

2. **주요 확인 사항**
   - [ ] 모든 interface의 필드명이 정확한가?
   - [ ] Record vs Array 타입이 올바른가?
   - [ ] Union type의 값이 정확한가?
   - [ ] Optional 필드를 누락하지 않았는가?

### 코드 작성 시 주의사항

1. **절대 사용하지 말 것**
   - `Stroke.size` → `Stroke.lineWidth` 사용
   - `Word.word` → `Word.text` 사용
   - `MessageType = 'chat'` → `'user'` 사용
   - `PlayerStatus = 'ready'` → 다른 상태 사용
   - `Round.category` → 제거됨, 사용 불가

2. **Record vs Array 구분**
   ```typescript
   // ✅ 올바른 초기화
   const canvasState: CanvasState = {
     strokes: {},  // Record는 {}로 초기화
     cleared: false,
     lastUpdated: Date.now(),
   };

   // ❌ 잘못된 초기화
   const canvasState: CanvasState = {
     strokes: [],  // 배열로 초기화하면 에러!
   };
   ```

3. **타입 일관성 유지**
   - 타입 정의를 변경할 때는 관련된 모든 파일 검색
   - `Grep` 도구 활용하여 사용처 찾기
   - 변경 후 반드시 `npm run build` 실행

## 타입 정의 변경 절차

타입을 수정할 때는 다음 순서를 따르세요:

1. **타입 파일 수정** (`types/*.ts`)
2. **사용처 검색**
   ```bash
   # 예: Stroke 타입 사용처 찾기
   grep -r "Stroke" --include="*.ts" --include="*.tsx"
   ```
3. **서비스 레이어 업데이트** (`lib/domains/*/services/`)
4. **훅 업데이트** (`lib/domains/*/hooks/`)
5. **컴포넌트 업데이트** (`components/`, `app/`)
6. **빌드 테스트**
   ```bash
   npm run build
   ```
7. **관련 문서 업데이트**

## 자주 발생하는 타입 에러

### 1. Property does not exist
```typescript
// ❌ 에러
stroke.size

// ✅ 해결
stroke.lineWidth
```

### 2. Type is not assignable to type
```typescript
// ❌ 에러
const answers: Record<string, RoundAnswer> = [];

// ✅ 해결
const answers: Record<string, RoundAnswer> = {};
```

### 3. Operator cannot be applied
```typescript
// ❌ 에러 (Record는 .length가 없음)
const count = round.answers.length;

// ✅ 해결
const count = Object.keys(round.answers).length;
```

## 타입 추가 시 가이드

새로운 타입을 추가할 때:

1. **적절한 위치에 정의**
   - Domain 관련: `types/{domain}.ts`
   - 공통: `types/common.ts`

2. **index.ts에 export 추가**
   ```typescript
   // types/index.ts
   export type { NewType } from './{domain}';
   ```

3. **초기값 명시**
   ```typescript
   export interface NewType {
     required: string;
     optional?: number;
   }
   ```

4. **사용 예시 주석 추가**
   ```typescript
   /**
    * NewType
    * 설명
    *
    * @example
    * const example: NewType = {
    *   required: 'value',
    *   optional: 123,
    * };
    */
   ```

## 상수 (Constants) 관리

**파일**: [lib/utils/constants.ts](lib/utils/constants.ts)

사용 가능한 상수:

```typescript
// 점수 관련
SCORE_CONSTANTS.DRAWER_ALL_CORRECT  // ✅ 존재
SCORE_CONSTANTS.DRAWER_BONUS        // ❌ 존재하지 않음!
```

**주의**: 존재하지 않는 상수를 사용하면 타입 에러가 발생합니다.

## 타입 안전성 향상을 위한 권장사항

1. **strict mode 유지**
   - `tsconfig.json`의 strict 옵션 유지

2. **any 타입 지양**
   - 불가피한 경우에만 사용
   - 가능한 구체적인 타입 정의

3. **타입 가드 활용**
   ```typescript
   if (round.answers && Object.keys(round.answers).length > 0) {
     // 안전하게 사용
   }
   ```

4. **유틸리티 타입 활용**
   ```typescript
   type PartialRoom = Partial<Room>;
   type RequiredSettings = Required<RoomSettings>;
   ```

## 트러블슈팅

### 빌드 에러 발생 시

1. 에러 메시지에서 파일 경로와 라인 번호 확인
2. 해당 파일의 타입 정의 확인
3. 이 문서의 "주요 타입 정의" 섹션 참고
4. 타입 정의 파일(`types/*.ts`) 직접 확인
5. 관련 사용처 모두 수정
6. 다시 빌드

### IDE에서 타입 에러가 표시되지 않을 때

1. TypeScript 서버 재시작 (VSCode: `Ctrl+Shift+P` → "Restart TS Server")
2. `node_modules` 삭제 후 재설치
3. `.next` 폴더 삭제 후 재빌드

## 참고 자료

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js with TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- 프로젝트 타입 정의: `types/` 디렉토리

---

**마지막 업데이트**: 2025-12-06
**작성자**: Claude
**버전**: 1.0
