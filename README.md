# 🏷️ Habiglow

루틴 관리 서비스 — **공감**과 **점진적 과부하(Progressive Overload)** 를 곁들인.

사용자가 꾸준히 성장하도록, 루틴 완료 기록/감정/코멘트를 남기고
최근 성과를 바탕으로 **상향/유지/하향**을 제안합니다.

---

## ✨ 핵심 가치

- **꾸준함**: streak/주간 목표로 동기 부여
- **공감 기반 기록**: 감정 이모지·코멘트로 맥락을 남김
- **점진적 과부하**: 최근 N일 성공률로 난이도 자동 제안
- **보상 루프**: 3회/7회/14회 등 마일스톤 보상(향후)

---

## 🧩 주요 기능

- **루틴 등록**
  - 카테고리(건강/공부/문화생활/기타)
  - 루틴 이름, 수행 시간/값, 단위
  - 점진적 과부하 여부(0/1), **과부하 주기**(일/주), **증가율 %**
- **루틴 완료**
  - 성공 여부/실제 완료량, 만족도(별점), 감정 이모티콘, 코멘트
- **루틴 조회/대시보드**
  - 카테고리별 성공률/점유율, 주간 성과
- **루틴 점검(제안)**
  - 주기마다 **상향/유지/하향** 제안 + AI 코멘트(계획)
- **캘린더/감정 히트맵**
  - 날짜별 진행도와 감정(색/표정) 시각화
- **루틴 디테일**
  - 히스토리·보상 진행도·과부하 기록 타임라인
- **분석 페이지**
  - 주간/카테고리 분석, 감정-성과 상관 인사이트(계획)
- **마이페이지**
  - 사용자 설정 관리
- **랭킹(옵션)**
  - MVP 이후, 우선 네비게이션 노출만

---

## 🧭 화면/내비 (초안)

- **랜딩 페이지**: 서비스 소개/사용법
- **로그인**: 소셜 로그인
- **홈**: 오늘의 루틴, 완료·상세
- **루틴 등록/수정**
- **캘린더**: 감정 히트맵
- **디테일**: 이력/보상/제안
- **분석**: 주간 리포트/대시보드
- **마이페이지**
- **랭킹(옵션)**

---

---

## 🛠 기술 스택

- **React Native (Expo)**
- **TypeScript**
- **Zustand** (전역 상태) + 낙관적 업데이트
- ESLint + Prettier + EditorConfig
- Tailwind (옵션)
- EAS (빌드/배포)

---

## 📂 폴더 구조

.
├── app/ # 라우팅/화면 엔트리
│ ├── (tabs)/
│ ├── \_layout.tsx
│ └── modal.tsx
├── assets/ # 이미지/폰트 등 정적 자원
├── constants/
│ └── Colors.ts
├── features/
│ └── routine/
│ ├── api.ts # fetch/create/complete (Mock→실서버)
│ ├── components/ # RoutineCard/AddRoutineModal/CompletionModal 등
│ ├── store.ts # Zustand 전역 스토어
│ ├── types.ts # Routine/CompletionRecord 타입
│ └── utils.ts # 과부하 제안(상향/유지/하향)
├── shared/
│ └── components/ # 공통 UI(Button 등)
├── docs/
│ ├── conventions.md # 컨벤션/브랜치/커밋 규칙
│ └── setup.md # 개발 환경 세팅 가이드
├── .editorconfig
├── .gitignore
├── app.json (또는 app.config.ts)
├── babel.config.js
├── eas.json
├── package.json
├── tailwind.config.js # (옵션)
└── tsconfig.json
