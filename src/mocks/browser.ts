import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

/**
 * 브라우저 환경용 MSW worker.
 * Storybook, 로컬 개발(선택)에서 사용합니다.
 */
export const worker = setupWorker(...handlers);
