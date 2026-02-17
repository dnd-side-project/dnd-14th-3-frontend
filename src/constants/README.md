# Constants

도메인·기능별 상수 (문구, 스텝 데이터, 설정값 등)

## 디렉터리 구조

- 도메인별 폴더 (`on-board/` 등) → 하위에 기능/용도별 파일
- 각 폴더는 `index.ts`에서 re-export

## 파일명 컨벤션

- `kebab-case` (예: `intro-steps.ts`)
- 상수는 `UPPER_SNAKE_CASE`로 export (예: `INTRO_STEPS`)
