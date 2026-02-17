import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jestDom from "eslint-plugin-jest-dom";
import playwright from "eslint-plugin-playwright";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // ignore
  { ignores: ["dist/**", "node_modules/**", "storybook-static/**"] },

  // JS 기본
  js.configs.recommended,

  // TS 기본 (typescript-eslint 메타 패키지 사용 시)
  ...tseslint.configs.recommended,

  // Prettier 충돌 방지
  prettierConfig,

  // 코드 스타일 규칙
{
  files: ["**/*.{ts,tsx,js,jsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    import: importPlugin,
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "react/react-in-jsx-scope": "off",

    ...reactHooks.configs.recommended.rules,

    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // 1) React 핵심 + React Router
          ["^react$", "^react-dom$", "^react-router-dom$"],
          [],

          // 2) 데이터·상태 (Zod, Zustand, React Query)
          ["^zod$", "^zustand$", "^@tanstack/react-query$"],
          [],

          // 3) HTTP
          ["^axios$"],
          [],

          // 4) UI·스타일 (Tailwind, Framer Motion)
          ["^tailwindcss$", "^framer-motion$"],
          [],

          // 5) 기타 외부 라이브러리
          ["^@?\\w"],
          [],

          // 6) 내부 모듈 (의존성 계층 순서)
          // 하위 계층 (독립적)
          ["^@/types(/.*|$)"], // 타입 정의 (가장 하위)
          ["^@/lib(/.*|$)"], // 유틸리티 함수
          ["^@/constants(/.*|$)"], // 상수
          [],

          // 중간 계층
          ["^@/api(/.*|$)"], // API 호출
          ["^@/services(/.*|$)"], // 비즈니스 로직
          ["^@/store(/.*|$)"], // 전역 상태
          [],

          // 상위 계층
          ["^@/hooks(/.*|$)"], // 커스텀 훅
          ["^@/queries(/.*|$)"], // React Query
          [],

          // UI 계층
          ["^@/components(/.*|$)"], // 컴포넌트
          ["^@/pages(/.*|$)"], // 페이지
          ["^@/router(/.*|$)"], // 라우터
          [],

          // 정적 리소스
          ["^@/assets(/.*|$)", "^@assets(/.*|$)"],
          ["^@public(/.*|$)"],
          [],

          // 스타일
          ["\\.css$"],
          [],

          // 상대 경로
          ["^\\."],
        ],
      },
    ],

    "simple-import-sort/exports": "error",

    "import/no-duplicates": "error",
  },
  },

  // 테스트 파일
{
  files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
  plugins: {
    "testing-library": testingLibrary,
    "jest-dom": jestDom,
  },
  rules: {
    ...testingLibrary.configs.react.rules,
    ...jestDom.configs.recommended.rules,
  },
  },

  // Playwright E2E
{
  files: [
    "**/*.e2e.{ts,tsx,js,jsx}",
    "e2e/**/*.{ts,tsx,js,jsx}",
    "playwright/**/*.{ts,tsx,js,jsx}",
  ],
  plugins: { playwright },
  rules: {
    ...playwright.configs["flat/recommended"].rules,
  },
}, ...storybook.configs["flat/recommended"]];
