import { authHandlers } from "./authHandlers";
import { exampleHandlers } from "./exampleHandlers";
import { profileHandlers } from "./profileHandlers";
import { userHandlers } from "./userHandlers";

/**
 * MSW request handlers.
 * Storybook, Vitest, 브라우저에서 공통으로 사용합니다.
 * 도메인별 handler를 여기에 합칩니다.
 */
export const handlers = [
  ...exampleHandlers,
  ...authHandlers,
  ...profileHandlers,
  ...userHandlers,
];
