# Word Domain

## 책임 및 역할
게임에 사용될 단어 관리, 단어 선택지 생성, 카테고리 및 난이도별 필터링을 담당하는 도메인입니다.

## 주요 서비스

### WordService
단어 선택 및 관리 로직을 담당하는 서비스 클래스입니다.

**주요 메서드:**
- `getWordChoices(settings)` - 설정에 맞는 3개의 단어 선택지 생성
- `getRandomWord(settings)` - 랜덤 단어 1개 선택
- `getWordsByCategory(category, difficulty?)` - 카테고리별 단어 목록
- `validateWord(word)` - 단어 유효성 검증
- `getTotalWordCount()` - 전체 단어 수
- `getCategoryWordCount(category, difficulty?)` - 카테고리별 단어 수

## 단어 데이터

### wordBank
카테고리와 난이도별로 분류된 단어 데이터베이스입니다.

**구조:**
```typescript
{
  word: string;           // 단어
  category: string;       // 카테고리 (food, animal, object, action)
  difficulty: string;     // 난이도 (easy, normal, hard)
}
```

**현재 단어 수:**
- 음식(food): 25개 (쉬움 10, 보통 10, 어려움 5)
- 동물(animal): 25개 (쉬움 10, 보통 10, 어려움 5)
- 사물(object): 25개 (쉬움 10, 보통 10, 어려움 5)
- 행동(action): 25개 (쉬움 10, 보통 10, 어려움 5)
- **총 100개**

## Use Case 매핑

이 도메인은 다음 Use Case를 담당합니다:

- **UC-7.1**: 단어 선택지 생성 - 라운드 시작 시 출제자에게 3개 선택지 제공
- **UC-7.2**: 단어 필터링 - 카테고리 및 난이도 설정에 맞는 단어 필터링
- **UC-7.3**: 랜덤 선택 - 자동 단어 선택 (시간 초과 시)

## 타입 정의

### Word
```typescript
interface Word {
  word: string;           // 단어
  category: string;       // 카테고리
  difficulty: string;     // 난이도
}
```

### WordChoice
```typescript
interface WordChoice {
  word: string;           // 단어
  category: string;       // 카테고리
}
```

## 단어 선택 로직

### 1. 필터링
```typescript
// 카테고리 및 난이도 필터
let filteredWords = wordBank.filter(word => {
  const categoryMatch = settings.category === 'all' || word.category === settings.category;
  const difficultyMatch = word.difficulty === settings.difficulty;
  return categoryMatch && difficultyMatch;
});
```

### 2. 폴백 (Fallback)
필터링된 단어가 3개 미만일 경우:

```typescript
// 1단계: 난이도 완화 (카테고리만 유지)
if (filteredWords.length < 3) {
  filteredWords = wordBank.filter(word => {
    return settings.category === 'all' || word.category === settings.category;
  });
}

// 2단계: 전체 단어에서 선택
if (filteredWords.length < 3) {
  filteredWords = wordBank;
}
```

### 3. 랜덤 선택
```typescript
// 셔플 후 3개 선택
const shuffled = shuffle([...filteredWords]);
const selected = shuffled.slice(0, 3);
```

## 카테고리 설명

### food (음식)
일상적인 음식부터 특별한 요리까지

**예시:**
- 쉬움: 사과, 바나나, 햄버거, 피자
- 보통: 스파게티, 타코, 초밥, 돈까스
- 어려움: 리소토, 까르보나라, 푸아그라

### animal (동물)
친숙한 동물부터 이국적인 동물까지

**예시:**
- 쉬움: 강아지, 고양이, 토끼, 코끼리
- 보통: 기린, 얼룩말, 판다, 캥거루
- 어려움: 미어캣, 아르마딜로, 프레리도그

### object (사물)
일상 용품 및 전자제품

**예시:**
- 쉬움: 연필, 책, 가방, 시계
- 보통: 키보드, 냉장고, 청소기, 세탁기
- 어려움: 가습기, 제습기, 식기세척기

### action (행동)
일상적인 행동 및 활동

**예시:**
- 쉬움: 달리기, 점프, 수영, 춤추기
- 보통: 그리기, 요리하기, 운전하기, 게임하기
- 어려움: 명상하기, 스트레칭, 줄넘기

## 난이도 기준

### easy (쉬움)
- 단순하고 구체적인 개념
- 시각적으로 표현하기 쉬움
- 누구나 알 수 있는 단어

### normal (보통)
- 좀 더 구체적이거나 특정한 개념
- 약간의 디테일 필요
- 대부분 알 수 있는 단어

### hard (어려움)
- 추상적이거나 복잡한 개념
- 세밀한 표현 필요
- 특정 지식이 필요할 수 있는 단어

## 사용 예시

```typescript
import { wordService } from '@/lib/domains/word/services/wordService';

// 게임 설정
const settings: RoomSettings = {
  maxPlayers: 6,
  category: 'food',
  difficulty: 'normal',
};

// 단어 선택지 생성
const choices = wordService.getWordChoices(settings);
// [
//   { word: '스파게티', category: 'food' },
//   { word: '타코', category: 'food' },
//   { word: '초밥', category: 'food' }
// ]

// 출제자가 선택
const selectedWord = choices[0].word; // '스파게티'

// 또는 자동 선택 (시간 초과 시)
const randomWord = wordService.getRandomWord(settings);
```

## 라운드 시작 플로우

```typescript
// 1. 라운드 시작 시
function startNewRound(drawerId: string, settings: RoomSettings) {
  // 2. 단어 선택지 생성
  const choices = wordService.getWordChoices(settings);

  // 3. 출제자에게 선택지 표시 (10초)
  showWordChoicesToDrawer(drawerId, choices);

  // 4. 출제자가 선택하거나 시간 초과 시 자동 선택
  const selectedWord = await waitForWordSelection(choices, 10000);

  // 5. 라운드 시작
  await gameService.startRound(
    roomCode,
    roundNumber,
    drawerId,
    selectedWord.word,
    selectedWord.category
  );
}
```

## 단어 추가 가이드

새로운 단어를 추가할 때 고려사항:

### 1. 카테고리 분류
- 명확한 카테고리에 속해야 함
- 여러 카테고리에 애매하면 가장 대표적인 카테고리 선택

### 2. 난이도 설정
```typescript
// 쉬움: 초등학생도 알 수 있는 단어
{ word: '강아지', category: 'animal', difficulty: 'easy' }

// 보통: 중고등학생이 알 수 있는 단어
{ word: '캥거루', category: 'animal', difficulty: 'normal' }

// 어려움: 특정 지식이 필요하거나 그리기 어려운 단어
{ word: '미어캣', category: 'animal', difficulty: 'hard' }
```

### 3. 그리기 가능성
- 시각적으로 표현 가능한 단어
- 너무 추상적이거나 개념적인 단어는 제외
- 오해의 소지가 있는 동음이의어는 주의

### 4. 단어 추가 예시
```typescript
export const wordBank: Word[] = [
  // ... 기존 단어들

  // 새 카테고리 추가 시
  { word: '축구', category: 'sport', difficulty: 'easy' },
  { word: '농구', category: 'sport', difficulty: 'easy' },
  { word: '배구', category: 'sport', difficulty: 'easy' },
];
```

## 향후 확장

### 1. 데이터베이스 연동
```typescript
// Firebase Realtime Database에 저장
// 관리자가 웹 UI로 단어 추가/삭제 가능
```

### 2. 사용자 제안 단어
```typescript
// 플레이어가 단어 제안 기능
// 관리자 승인 후 단어 은행에 추가
```

### 3. 단어 통계
```typescript
// 각 단어별 사용 횟수, 정답률 추적
// 인기 단어, 어려운 단어 분석
```

### 4. 다국어 지원
```typescript
interface Word {
  word: string;
  translations: {
    en: string;
    ja: string;
    zh: string;
  };
  category: string;
  difficulty: string;
}
```

## 단어 밸런싱

### 현재 분포
- 각 카테고리: 25개
- 각 난이도: 쉬움(40%), 보통(40%), 어려움(20%)

### 권장 분포
게임의 재미를 위해 다음 분포 유지:
- 쉬움: 30-40% (초보자 친화적)
- 보통: 40-50% (메인 컨텐츠)
- 어려움: 10-30% (도전 요소)

## 테스트

```typescript
// 단어 선택지 테스트
describe('WordService', () => {
  it('should return 3 word choices', () => {
    const choices = wordService.getWordChoices({
      maxPlayers: 6,
      category: 'all',
      difficulty: 'normal',
    });
    expect(choices).toHaveLength(3);
  });

  it('should filter by category', () => {
    const choices = wordService.getWordChoices({
      maxPlayers: 6,
      category: 'food',
      difficulty: 'easy',
    });
    choices.forEach(choice => {
      expect(choice.category).toBe('food');
    });
  });

  it('should fallback when not enough words', () => {
    // 난이도 완화 테스트
    const choices = wordService.getWordChoices({
      maxPlayers: 6,
      category: 'food',
      difficulty: 'hard',
    });
    expect(choices).toHaveLength(3);
  });
});
```
