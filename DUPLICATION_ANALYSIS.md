# 중복 코드 발생 원인 분석 및 방지책

## 발생한 중복 사례
**문제**: "존재하지 않는 방입니다" 체크 로직이 4개 파일에 중복
- `app/room/[code]/page.tsx`
- `app/room/[code]/waiting/page.tsx`
- `app/room/[code]/playing/page.tsx`
- `app/room/[code]/finished/page.tsx`

## 중복 발생 원인

### 1. **페이지별 독립 개발**
- 각 페이지를 만들 때 이전 페이지를 복사-붙여넣기로 시작
- 공통 로직을 추출하지 않고 그대로 사용
- "일단 작동하게" 만드는 데 집중

### 2. **점진적 기능 추가**
- 초기에는 한 페이지만 있었음
- 새 페이지를 추가할 때마다 기존 코드를 복사
- 공통 패턴을 인식하지 못함

### 3. **명시적 가이드라인 부재**
- `claude.md`에 "중복 제거" 원칙은 있었지만
- **언제, 어떻게 추출할지**에 대한 구체적 기준이 없었음
- 코드 리뷰 프로세스 부재

### 4. **Hook 우선 사고 부족**
- React Hook으로 추출할 수 있는 로직인지 먼저 고려하지 않음
- useEffect를 직접 작성하는 것이 기본이 됨

## 해결 방법

### 즉시 적용
✅ `useRoomValidation` Hook 생성 및 적용 완료

### 장기 방지책

#### 1. **3번 규칙 (Rule of Three)**
```
같은 코드가 3곳에 나타나면 즉시 공통화
- 2곳: 주의 깊게 관찰
- 3곳: 무조건 추출
```

#### 2. **페이지 생성 시 체크리스트**
새 페이지를 만들 때:
- [ ] 기존 페이지와 비슷한 로직이 있는가?
- [ ] useEffect가 2개 이상 중복되는가?
- [ ] 같은 조건문/에러 메시지가 있는가?
→ YES면 Hook으로 추출

#### 3. **Hook 우선 설계**
```
❌ 나쁜 순서:
페이지 작성 → 복붙 → 수정 → 완료

✅ 좋은 순서:
공통 패턴 파악 → Hook 추출 → 페이지에서 사용
```

#### 4. **코드 리뷰 자동화**
다음 패턴이 2곳 이상 나타나면 경고:
- 같은 useEffect 의존성 배열
- 같은 에러 메시지 문자열
- 같은 조건문 (if/switch)

## 구체적 적용 규칙

### Hook 추출 기준
1. **같은 useEffect가 2개 파일에 있으면** → Hook으로 추출
2. **같은 유효성 검사 로직** → Hook으로 추출
3. **같은 에러 처리 패턴** → Hook으로 추출

### 파일 구조
```
lib/domains/{domain}/hooks/
  ├── use{Domain}.ts          # 메인 Hook
  ├── use{Domain}Validation.ts # 검증 Hook
  └── use{Domain}Actions.ts    # 액션 Hook
```

### 명명 규칙
- 유효성 검사: `use{Domain}Validation`
- 상태 관리: `use{Domain}State`
- 액션: `use{Domain}Actions`

## 실제 적용 예시

### Before (중복)
```tsx
// waiting/page.tsx
useEffect(() => {
  if (!room && !roomLoading && roomCode) {
    alert('존재하지 않는 방입니다.');
    router.push('/');
  }
}, [room, roomLoading, roomCode, router]);

// playing/page.tsx (똑같은 코드)
// finished/page.tsx (똑같은 코드)
```

### After (공통화)
```tsx
// hooks/useRoomValidation.ts
export function useRoomValidation({ room, roomLoading, roomCode }) {
  const router = useRouter();
  useEffect(() => {
    if (!roomCode || roomLoading) return;
    if (!room) {
      alert('존재하지 않는 방입니다.');
      router.push('/');
    }
  }, [room, roomLoading, roomCode, router]);
}

// 모든 페이지에서
useRoomValidation({ room, roomLoading, roomCode });
```

## 앞으로의 원칙

### 개발 시
1. **코드 작성 전**: 비슷한 로직이 있는지 먼저 검색
2. **코드 작성 중**: 복붙하는 순간 Hook 추출 고려
3. **코드 작성 후**: 같은 패턴 3개 이상이면 즉시 리팩토링

### AI 어시스턴트 가이드
```
새 페이지/컴포넌트 생성 시:
1. 기존 코드와 유사한 로직 검색
2. 중복 발견 시 Hook 추출 제안
3. 사용자 동의 후 적용
```

## 체크리스트

코드 리뷰 시 확인:
- [ ] 같은 useEffect가 여러 파일에 있는가?
- [ ] 같은 문자열 리터럴이 3곳 이상인가?
- [ ] 같은 조건문이 반복되는가?
- [ ] 비슷한 상태 관리 로직이 있는가?

하나라도 YES면 → 공통화 필요!
