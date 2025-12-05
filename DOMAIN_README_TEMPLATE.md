# {Domain} Domain

> 이 파일은 `lib/domains/{domain}/README.md`의 템플릿입니다.

## 책임 및 역할

{이 도메인이 담당하는 핵심 책임을 간략히 설명}

---

## Use Case 매핑

이 도메인이 담당하는 Use Case:

- **UC-X.X**: {Use Case 이름}
  - 설명: {간단한 설명}
  - 관련 서비스: `{ServiceName}.{methodName}()`
  - 관련 Hook: `use{HookName}()`

---

## 서비스 (Services)

### {ServiceName}

**파일**: `services/{serviceName}.ts`

**책임**: {서비스의 책임}

**메서드**:

#### `methodName(params): Promise<ReturnType>`
- **설명**: {메서드 설명}
- **파라미터**:
  - `param1` (Type): 설명
  - `param2` (Type): 설명
- **반환값**: {반환값 설명}
- **사용 예시**:
  ```typescript
  const result = await service.methodName(param1, param2);
  ```

---

## Hooks

### `use{HookName}()`

**파일**: `hooks/use{HookName}.ts`

**설명**: {Hook 설명}

**파라미터**:
- `param1` (Type): 설명

**반환값**:
```typescript
{
  data: Type;
  loading: boolean;
  error: Error | null;
  methods: {
    doSomething: () => void;
  };
}
```

**사용 예시**:
```typescript
const { data, loading, methods } = useHookName(param1);

useEffect(() => {
  methods.doSomething();
}, []);
```

---

## 타입 정의

### {TypeName}

**파일**: `types.ts`

```typescript
export interface TypeName {
  id: string;
  property1: Type;
  property2: Type;
}
```

**설명**: {타입 설명}

---

## Firebase 경로

이 도메인이 사용하는 Firebase Realtime Database 경로:

- `/path/to/data` - {설명}
- `/another/path/{id}` - {설명}

자세한 내용은 [firebase-database-structure.md](../../../firebase-database-structure.md) 참조

---

## 의존성

### 다른 도메인 의존성

- **{DomainName}**: {의존 이유}

### 외부 라이브러리

- `library-name`: {사용 목적}

---

## 주의사항

- {주의사항 1}
- {주의사항 2}

---

## 변경 이력

| 날짜 | 변경 내용 | 관련 UC |
|------|----------|---------|
| YYYY-MM-DD | {변경 내용} | UC-X.X |

---

*이 문서는 도메인 변경사항을 반영하여 자동으로 업데이트됩니다.*
