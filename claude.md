# Catchmind 프로젝트

## 프로젝트 개요
실시간 그림 추측 게임 (Catchmind/Skribbl.io 스타일)

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase Realtime Database

## 프로젝트 구조
```
catchmind/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 로그인 (닉네임 입력)
│   ├── lobby/              # 로비 (방 목록/생성)
│   └── room/[code]/        # 게임 방
│       ├── waiting/        # 대기실
│       ├── playing/        # 게임 진행
│       └── finished/       # 게임 종료
├── components/             # React 컴포넌트
├── lib/
│   ├── domains/            # 도메인별 로직
│   ├── firebase/           # Firebase 설정
│   └── utils/              # 공통 유틸
└── types/                  # TypeScript 타입
```

## 주요 문서
- [catchmind-spec.md](catchmind-spec.md): 전체 기획서
- [features.md](features.md): 기능 명세서
- [use-cases.md](use-cases.md): 유스케이스
- [domain-model.md](domain-model.md): 도메인 모델
- [firebase-database-structure.md](firebase-database-structure.md): Firebase DB 구조

---

## 개발 원칙

### 코드 작성
- 애매한 경우 항상 물어보기
- SOLID 원칙 준수 (특히 단일 책임, 개방-폐쇄)
- **중복 제거 - 3번 규칙**
  - 같은 코드가 3곳에 나타나면 즉시 공통화 (Hook/유틸 함수로 추출)
  - 2곳이면 주의 깊게 관찰, 3번째 발견 시 즉시 리팩토링
  - React 로직 중복 → Custom Hook
  - 유틸 함수 중복 → utils/ 로 추출
- 낮은 결합도, 높은 응집도 유지
- 생성 시점에 의존성 주입 및 유효성 검사
- **예외처리 최소화** - 자연스러운 플로우로 연결, 서비스 레이어에서 조용히 처리

### 문서 작성 (이문서 포함)
- 중복 내용 제거 - 한곳에서 참조
- 단일 책임 원칙 적용 - 각 문서는 하나의 주제만
- 동적으로 관리할 수 있게 개방 폐쇄 원칙 적용 (하드코딩이 필요하다면 예시로서만 참고하게)
- 명확하고 간결하게

---

## 반복 이슈 관리

동일 이슈 반복 발견 시:
1. 근본 원인 분석
2. 범위에 맞는 README 작성/업데이트
3. 이슈 제목, 원인, 해결 방법(코드 예시), 주의사항 포함

**작성 위치:**
- 전역 이슈 → [COMMON_ISSUES.md](COMMON_ISSUES.md)
  - React Hook, TypeScript, Next.js 등
- 도메인별 이슈 → 해당 폴더 README.md
  - [Firebase](lib/firebase/README.md)
  - [Canvas](lib/domains/canvas/README.md)

---

## 코딩 컨벤션
- TypeScript strict mode
- 함수형 컴포넌트 + React Hooks
- ESLint/Prettier 설정 준수

## 주요 주의사항
각 영역별 README를 참조하세요:
- 전역: [COMMON_ISSUES.md](COMMON_ISSUES.md)
- 도메인/폴더별: 해당 폴더의 README.md
  - 예: `lib/firebase/README.md`, `lib/domains/canvas/README.md`
