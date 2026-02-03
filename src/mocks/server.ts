import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * Node 환경용 MSW server.
 * Vitest 등 테스트에서 사용합니다.
 */
export const server = setupServer(...handlers);
