# Catchmind 프로젝트

## 프로젝트 개요
실시간 그림 추측 게임 (Catchmind/Skribbl.io 스타일)

## 기술 스택
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase Realtime Database

## 프로젝트 구조
```
catchmind/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 홈 (닉네임 입력)
│   └── room/[code]/        # 동적 라우팅 (방 코드)
│       ├── page.tsx        # 방 진입점 (리다이렉션)
│       ├── waiting/        # 대기실
│       ├── playing/        # 게임 진행
│       └── finished/       # 게임 종료
├── components/             # React 컴포넌트 (game/, shared/)
├── lib/
│   ├── domains/            # 도메인별 로직 (user, room, game, canvas, chat, answer, word)
│   ├── firebase/           # Firebase 설정 및 유틸
│   └── utils/              # 공통 유틸리티
└── types/                  # TypeScript 타입 정의
```

## 주요 문서
- [catchmind-spec.md](catchmind-spec.md): 전체 기획서
- [features.md](features.md): 상세 기능 명세서
- [use-cases.md](use-cases.md): 유스케이스 시나리오
- [domain-model.md](domain-model.md): 도메인 모델 정의
- [firebase-database-structure.md](firebase-database-structure.md): Firebase DB 구조 및 보안 규칙

## 개발 가이드라인

### 기본 원칙
- 애매한 경우 항상 물어보기
- SOLID 원칙 준수
- 코드 중복 최소화
- 필수 필드는 생성 시 유효성 검사
- **반복되는 이슈 발견 시**:
  - 근본 원인 분석 후 해당 섹션에 구체적인 예시와 함께 주의사항 추가
  - 예: "Firebase 배열 처리" 섹션처럼 실제 코드 예시 포함

### 코딩 컨벤션
- TypeScript strict mode
- 함수형 컴포넌트 및 React Hooks
- ESLint 및 Prettier 설정 준수

### Firebase 주의사항
- **배열 처리**: Firebase는 배열을 객체로 저장하므로, 배열 메서드 사용 전 `Array.isArray` 체크 필요
  ```typescript
  const array = Array.isArray(data) ? data : Object.values(data);
  ```
- 실시간 리스너는 컴포넌트 언마운트 시 정리 필수
- 환경변수(.env.local)에 Firebase 설정 저장
