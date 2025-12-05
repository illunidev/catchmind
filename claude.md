# Catchmind 프로젝트

## 프로젝트 개요
실시간 그림 추측 게임 (Catchmind/Skribbl.io 스타일)

## 기술 스택

### Frontend & Backend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS (예상)

### Database & Real-time
- **Database**: Firebase Realtime Database
- **Real-time Communication**: Firebase Realtime Database를 통한 실시간 동기화

## 프로젝트 구조 (간략)
```
catchmind/
├── app/              # Next.js App Router (/, /room/[code])
├── components/       # React 컴포넌트 (game/, lobby/, shared/)
├── lib/
│   ├── domains/     # 도메인별 로직 (user, room, game, canvas, chat, answer, word)
│   ├── firebase/    # Firebase 설정
│   └── utils/       # 유틸리티
├── types/            # TypeScript 타입
└── public/           # 정적 파일
```
> 자세한 구조 및 아키텍처는 [project-structure.md](project-structure.md) 참조

## 주요 문서
- [features.md](features.md): 상세 기능 명세서
- [domain-model.md](domain-model.md): 도메인 모델 및 엔티티 정의
- [use-cases.md](use-cases.md): 유스케이스 시나리오
- [catchmind-spec.md](catchmind-spec.md): 전체 기획서 (기술 스택 중립적)
- [firebase-database-structure.md](firebase-database-structure.md): Firebase Realtime Database 구조 및 보안 규칙
- [project-structure.md](project-structure.md): 프로젝트 폴더 구조 및 아키텍처

## 개발 가이드라인
 - 애매한 경우 항상 물어봐줘
 - SOLID원칙을 모두 준수 해줘
 - 중복되는 내용이 없게 해줘

### 도메인별 문서화 규칙
각 도메인 폴더(`lib/domains/{domain}/`)에는 **README.md** 파일을 두고 다음 내용을 포함:
- 도메인 책임 및 역할
- 주요 서비스/Hook 설명
- Use Case 매핑 (어떤 UC를 담당하는지)
- 타입 정의 설명
- 사용 예시

**자동 참조 규칙:**
- 도메인 수정 시 해당 도메인의 README.md 자동 업데이트
- Use Case 변경 시 관련 도메인 README.md 참조 및 업데이트
- 새 도메인 추가 시 README.md 템플릿 자동 생성

**도메인 README 경로:**
```
lib/domains/user/README.md
lib/domains/room/README.md
lib/domains/game/README.md
lib/domains/canvas/README.md
lib/domains/chat/README.md
lib/domains/answer/README.md
lib/domains/word/README.md
```

### 코딩 컨벤션
- TypeScript strict mode 사용
- 함수형 컴포넌트 및 React Hooks 사용
- ESLint 및 Prettier 설정 준수

### Firebase 사용 시 주의사항
- 환경변수(.env.local)에 Firebase 설정 저장
- 실시간 리스너는 컴포넌트 언마운트 시 정리 필수
- 보안 규칙 설정 필수

### Git 워크플로우
- main 브랜치: 안정 버전
- feature/* 브랜치: 새 기능 개발
- 커밋 메시지는 명확하고 간결하게

## 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경 변수
`.env.local` 파일에 다음 Firebase 설정 필요:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
