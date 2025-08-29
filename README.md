# 🏋️ Routine App

일상 루틴을 관리하고 **점진적 과부하(Progressive Overload)** 로 꾸준한 성장을 돕는 모바일 앱입니다.  
루틴 등록/완료/이력/제안(상향·유지·하향) 기능을 제공합니다.

## 🧩 핵심 기능

- 루틴 등록(주기/기본값/성장 모드)
- 루틴 완료 리뷰(실제량·만족도·코멘트)
- 루틴 이력/통계, streak 관리
- 과거 성공률 기반 **과부하 제안 로직**
- 전역 상태(Zustand) + 낙관적 업데이트

## 🛠 기술 스택

- **React Native (Expo)**
- **TypeScript**
- **Zustand** (상태 관리)
- ESLint + Prettier + EditorConfig
- EAS (빌드/배포)

## 📂 폴더 구조

.
├── app/ # 라우팅/화면 엔트리
├── assets/ # 이미지/폰트 등 정적 자원
├── features/
│ └── routine/
│ ├── api.ts
│ ├── components/
│ ├── store.ts
│ ├── types.ts
│ └── utils.ts
├── shared/ # 공통 UI/유틸
├── docs/
│ ├── conventions.md # 컨벤션/브랜치/커밋 규칙
│ └── setup.md # 개발 환경 세팅 가이드
├── .editorconfig
├── .gitignore
├── app.config.ts / app.json
├── babel.config.js
├── eas.json
├── package.json
├── tailwind.config.js (옵션)
└── tsconfig.json
