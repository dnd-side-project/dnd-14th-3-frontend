# dnd-14th-3-frontend

DND 14기 3팀 프론트엔드 프로젝트 (TypeScript 기반)

## 기술 스택

### 코어

- **React 18.3.1** - UI 라이브러리
- **TypeScript 5.9.3** - 타입 안정성
- **Vite 7.2.4** - 빌드 도구

### 상태 관리

- **Zustand 5.0.10** - 전역 상태 관리
- **TanStack React Query 5.90.20** - 서버 상태 관리

### 스타일링

- **Tailwind CSS 4.1.18** - 유틸리티 CSS 프레임워크

### 폼 & 유효성 검사

- **Zod 3.25.76** - 런타임 타입 검증

### 테스트

- **Vitest 4.0.18** - 유닛 테스트
- **React Testing Library 16.3.2** - 컴포넌트 테스트
- **Playwright 1.58.0** - E2E 테스트

### 지도

- **react-kakao-maps-sdk 1.2.0** - 카카오맵 API

### 코드 품질

- **ESLint** - 코드 린팅
- **Prettier 3.8.1** - 코드 포맷팅
- **EditorConfig** - 에디터 설정 통일

## 설치

```bash
npm install
```

## 스크립트

### 개발 서버

```bash
# 개발 서버 시작 (핫 리로드 지원)
npm run dev
# → http://localhost:5173 에서 개발 서버 실행
# → 파일 변경 시 자동으로 브라우저 새로고침
```

### 빌드

```bash
# 프로덕션 빌드 (최적화된 번들 생성)
npm run build
# → dist/ 폴더에 빌드 결과물 생성
# → 압축, 최적화, 트리쉐이킹 적용

# 빌드 결과 미리보기
npm run preview
# → 프로덕션 빌드를 로컬에서 테스트
# → 실제 배포 환경과 동일한 방식으로 실행
```

### 코드 품질

```bash
# ESLint로 코드 검사
npm run lint
# → JavaScript/TypeScript 코드 스타일 및 잠재적 오류 검사
# → eslint.config.js 규칙 적용

# Prettier로 코드 자동 포맷팅
npm run format
# → src/ 폴더의 모든 코드 파일 자동 정리
# → .prettierrc 설정에 따라 포맷팅

# Prettier 포맷팅 검사 (CI/CD용)
npm run format:check
# → 포맷팅이 올바른지 검사만 수행 (수정하지 않음)
# → CI 파이프라인에서 사용
```

### 유닛 테스트 (Vitest + React Testing Library)

```bash
# 테스트 Watch 모드 (개발 중 사용)
npm run test
# → 파일 변경 시 관련 테스트 자동 재실행
# → 인터랙티브 CLI 제공

# 테스트 UI 모드
npm run test:ui
# → 브라우저에서 테스트 결과 시각화
# → 각 테스트 상세 정보 확인 가능

# 테스트 한 번만 실행 (CI/CD용)
npm run test:run
# → Watch 모드 없이 모든 테스트 1회 실행
# → 빌드 파이프라인에서 사용

# 테스트 커버리지 리포트 생성
npm run test:coverage
# → coverage/ 폴더에 HTML 리포트 생성
# → 코드 커버리지 확인 가능
```

### E2E 테스트 (Playwright)

```bash
# E2E 테스트 실행 (헤드리스 모드)
npm run test:e2e
# → 모든 브라우저에서 E2E 테스트 실행
# → CI 환경에서 사용하기 좋음

# Playwright UI 모드
npm run test:e2e:ui
# → 테스트를 단계별로 확인하고 디버깅
# → 타임 트래블 기능으로 각 단계 재생 가능

# 브라우저 표시 모드 (헤드풀)
npm run test:e2e:headed
# → 실제 브라우저를 띄워서 테스트 실행
# → 테스트 과정을 눈으로 확인 가능
```

## 코딩 컨벤션

파일명, import 순서 등 프로젝트 컨벤션은 [프론트엔드_코딩 컨벤션](https://www.notion.so/2f1a2177353a80718546d418d168eed2)를 참고하세요.

## 프로젝트 구조

```
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Button, Input 등)
│   │   ├── layout/          # 레이아웃 컴포넌트 (Header, Footer 등)
│   │   └── domain/          # 도메인별 컴포넌트
│   ├── hooks/               # 커스텀 React 훅
│   ├── api/                 # API 통신 함수 (순수 API 호출)
│   ├── queries/             # React Query 훅 & Query Key 관리
│   ├── services/            # 비즈니스 로직
│   ├── lib/                 # 순수 유틸리티 함수
│   ├── store/               # Zustand 전역 상태 관리
│   ├── pages/               # 라우트별 페이지 컴포넌트
│   ├── router/              # React Router 설정
│   │   └── guards/          # 라우트 가드
│   ├── types/               # TypeScript 타입 정의
│   ├── assets/              # 이미지, 아이콘 등 정적 리소스
│   ├── test/                # 테스트 유틸리티
│   │   └── setup.ts         # Vitest 설정
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 엔트리 포인트
│   ├── index.css            # 전역 스타일
│   └── vite-env.d.ts        # Vite 타입 정의
├── e2e/                     # Playwright E2E 테스트
├── public/                  # 정적 파일 (favicon 등)
├── vite.config.ts           # Vite 설정
├── vitest.config.ts         # Vitest 설정
├── playwright.config.ts     # Playwright 설정
├── tsconfig.json            # TypeScript 메인 설정
├── tsconfig.app.json        # 앱 코드 TypeScript 설정
├── tsconfig.node.json       # 빌드 도구 TypeScript 설정
├── eslint.config.js         # ESLint 설정
├── .prettierrc              # Prettier 설정
├── .editorconfig            # EditorConfig 설정
├── .coderabbit.yaml         # CodeRabbit AI 리뷰 설정
├── .env.example             # 환경 변수 예제
└── README.md                # 프로젝트 문서
```

## Path Alias

TypeScript와 Vite에서 다음 경로 별칭을 사용할 수 있습니다:

### 전체 접근

```typescript
import { User } from "@/types/user";
import { formatDate } from "@/lib/format";
import { userApi } from "@/api/user.api";
```

### 각 레이어별 별칭

```typescript
// 하위 계층 (독립적)
import type { User } from "@/types";
import { formatDate } from "@/lib/format";

// 중간 계층
import { userApi } from "@/api/user.api";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";

// 상위 계층
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/queries/user.query";

// UI 계층
import Button from "@/components/common/Button";
import HomePage from "@/pages/Home/HomePage";
import { ROUTES } from "@/router/routes";

// 정적 리소스
import logo from "@/assets/logo.png";
import logo2 from "@assets/logo.png"; // 축약형도 가능
import icon from "@public/icon.svg";
```

### Import 순서 (ESLint 자동 정렬)

의존성 계층 순서대로 자동 정렬됩니다:

1. React 핵심 → 2. 외부 라이브러리 → 3. types → 4. lib → 5. api → 6. services → 7. store → 8. hooks → 9. queries → 10. components → 11. pages → 12. router → 13. assets

## 테스트 실행 전 준비

Playwright 브라우저를 처음 사용하는 경우 설치가 필요합니다:

```bash
npx playwright install
```

## AI 코드 리뷰

이 프로젝트는 CodeRabbit을 사용하여 PR에 대한 자동 코드 리뷰를 제공합니다.
리뷰 설정은 `.coderabbit.yaml`에서 확인할 수 있습니다.

## 라이선스

MIT
