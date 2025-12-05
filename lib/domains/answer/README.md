# Answer Domain

## 책임 및 역할
사용자 입력을 검증하고 정답 여부를 판단하며, 유사도 기반 힌트를 제공하는 도메인입니다.

## 주요 서비스

### AnswerService
정답 검증 로직을 담당하는 서비스 클래스입니다.

**주요 메서드:**
- `checkAnswer(userAnswer, correctAnswer)` - 정답 검증 및 유사도 계산
- `normalizeAnswer(answer)` - 정답 정규화 (공백, 특수문자 제거, 소문자 변환)
- `calculateSimilarity(str1, str2)` - 레벤슈타인 거리 기반 유사도 계산
- `levenshteinDistance(str1, str2)` - 레벤슈타인 거리 계산

## 주요 Hook

### useAnswerCheck
정답 체크 로직을 제공하는 훅입니다.

**반환 값:**
- `checkAnswer(userAnswer, correctAnswer)` - 정답 체크 함수
- `lastResult` - 마지막 체크 결과 (AnswerCheckResult | null)
- `resetResult()` - 결과 초기화 함수

## Use Case 매핑

이 도메인은 다음 Use Case를 담당합니다:

- **UC-6.1**: 정답 검증 - 사용자 입력과 정답 비교
- **UC-6.2**: 유사도 계산 - 레벤슈타인 거리 알고리즘 사용
- **UC-6.3**: 힌트 제공 - 유사도에 따른 힌트 메시지 제공

## 타입 정의

### AnswerCheckResult
```typescript
interface AnswerCheckResult {
  isCorrect: boolean;     // 정답 여부
  similarity: number;     // 유사도 (0-100)
  hint?: string;          // 힌트 메시지 (선택)
}
```

### RoundAnswer
```typescript
interface RoundAnswer {
  userId: string;         // 플레이어 ID
  answer: string;         // 제출한 답
  isCorrect: boolean;     // 정답 여부
  timestamp: number;      // 제출 시간
  score: number;          // 획득 점수
}
```

## 정답 검증 로직

### 1. 정답 정규화
```typescript
normalizeAnswer(answer: string): string {
  return answer
    .trim()                              // 앞뒤 공백 제거
    .toLowerCase()                       // 소문자 변환
    .replace(/\s+/g, '')                // 모든 공백 제거
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); // 특수문자 제거
}
```

**예시:**
- "사 과" → "사과"
- "APPLE" → "apple"
- "강아지!" → "강아지"

### 2. 완전 일치 체크
```typescript
if (normalizedUser === normalizedCorrect) {
  return {
    isCorrect: true,
    similarity: 100,
  };
}
```

### 3. 유사도 계산
레벤슈타인 거리 (편집 거리) 알고리즘 사용:
```typescript
similarity = ((maxLength - distance) / maxLength) * 100
```

**편집 거리란?**
- 한 문자열을 다른 문자열로 변환하는데 필요한 최소 편집 횟수
- 편집 연산: 삽입, 삭제, 교체

**예시:**
- "사과" vs "사자" → distance: 1, similarity: 50%
- "apple" vs "aple" → distance: 1, similarity: 80%
- "강아지" vs "강아" → distance: 1, similarity: 66%

### 4. 힌트 제공
```typescript
// 유사도 80% 이상
if (similarity >= 80) {
  return { isCorrect: false, similarity, hint: '비슷해요!' };
}

// 부분 포함
if (correct.includes(user) || user.includes(correct)) {
  return { isCorrect: false, similarity, hint: '거의 다 왔어요!' };
}
```

## 레벤슈타인 거리 알고리즘

동적 계획법(DP)을 사용하여 효율적으로 계산:

```typescript
// DP 테이블
dp[i][j] = 문자열1의 i번째까지와 문자열2의 j번째까지의 편집 거리

// 점화식
if (str1[i] == str2[j]) {
  dp[i][j] = dp[i-1][j-1]  // 같으면 이전 상태 유지
} else {
  dp[i][j] = min(
    dp[i-1][j] + 1,    // 삭제
    dp[i][j-1] + 1,    // 삽입
    dp[i-1][j-1] + 1   // 교체
  )
}
```

**시간 복잡도:** O(n × m)
**공간 복잡도:** O(n × m)

**예시 계산:**

"사과" vs "사자"
```
    ""  사  자
""   0   1   2
사   1   0   1
과   2   1   1
```
→ 편집 거리: 1

## 사용 예시

```typescript
import { useAnswerCheck } from '@/lib/domains/answer/hooks/useAnswerCheck';

function AnswerInput({ correctWord, onCorrect }) {
  const { checkAnswer, lastResult } = useAnswerCheck();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkAnswer(input, correctWord);

    if (result.isCorrect) {
      onCorrect();
      setInput('');
    } else if (result.hint) {
      // 힌트 표시
      alert(result.hint);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="정답을 입력하세요"
      />
      <button type="submit">제출</button>

      {lastResult && !lastResult.isCorrect && lastResult.hint && (
        <p className="hint">{lastResult.hint}</p>
      )}
    </form>
  );
}
```

## 실제 게임 플로우

```typescript
// 게임 컴포넌트에서 사용
function GameRoom() {
  const { checkAnswer } = useAnswerCheck();
  const { submitAnswer } = useGame(roomCode);
  const { sendMessage, sendAnswerMessage } = useChat({...});

  const handleAnswerSubmit = async (input: string) => {
    // 1. 로컬 검증
    const result = checkAnswer(input, currentRound.word);

    if (result.isCorrect) {
      // 2. 정답 - Firebase에 기록
      await submitAnswer(userId, input, currentRound.word);

      // 3. 정답 메시지 전송
      await sendAnswerMessage(input);

      // 4. UI 업데이트
      showCorrectAnimation();
    } else {
      // 5. 오답 - 일반 채팅으로 전송
      await sendMessage(input);

      // 6. 힌트 표시
      if (result.hint) {
        showHint(result.hint);
      }
    }
  };

  return (
    <AnswerInput
      correctWord={currentRound?.word}
      onSubmit={handleAnswerSubmit}
    />
  );
}
```

## 향후 개선 사항

### 1. 한글 자모 분리 유사도
```typescript
// 초성, 중성, 종성 분리하여 비교
"강아지" vs "강아저"
// 초성: ㄱㅇㅈ vs ㄱㅇㅈ (100%)
// 중성: ㅏㅏㅣ vs ㅏㅏㅓ (66%)
// 종성: -ㅇ- vs -ㅇ- (100%)
// → 종합 유사도 향상
```

### 2. 발음 유사도
```typescript
// 비슷한 발음 체크
"강아지" vs "깡아지" → 발음 유사도 높음
```

### 3. 타이핑 오류 보정
```typescript
// 인접 키 오타 감지
"apple" vs "appke" → 'l'과 'k' 인접 → 높은 유사도
```

## 테스트 케이스

```typescript
// 완전 일치
checkAnswer("사과", "사과")
// → { isCorrect: true, similarity: 100 }

// 공백 무시
checkAnswer("사 과", "사과")
// → { isCorrect: true, similarity: 100 }

// 대소문자 무시
checkAnswer("APPLE", "apple")
// → { isCorrect: true, similarity: 100 }

// 유사도 높음
checkAnswer("사자", "사과")
// → { isCorrect: false, similarity: 50, hint: undefined }

// 부분 포함
checkAnswer("강아", "강아지")
// → { isCorrect: false, similarity: 66, hint: '거의 다 왔어요!' }

// 유사도 낮음
checkAnswer("바나나", "사과")
// → { isCorrect: false, similarity: 0, hint: undefined }
```

## 성능 최적화

1. **정규화 캐싱**: 같은 정답에 대해 반복 정규화 방지
2. **조기 종료**: 완전 일치 시 유사도 계산 스킵
3. **DP 테이블 재사용**: 메모이제이션 활용 (구현 예정)
