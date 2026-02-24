import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;
// 개발 환경이 아닐 때는 아무것도 하지 않는 함수
const noop = () => {};

const toError = (e: unknown): Error => {
  if (e instanceof Error) return e;
  if (typeof e === "string") return new Error(e);
  try {
    return new Error(JSON.stringify(e));
  } catch {
    return new Error(String(e));
  }
};

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  time: isDev ? console.time.bind(console) : noop,
  timeEnd: isDev ? console.timeEnd.bind(console) : noop,
  table: isDev ? console.table.bind(console) : noop,
  group: isDev ? console.group.bind(console) : noop,
  groupCollapsed: isDev ? console.groupCollapsed.bind(console) : noop,
  groupEnd: isDev ? console.groupEnd.bind(console) : noop,
  trace: isDev ? console.trace.bind(console) : noop,

  warn: (...args: unknown[]) => {
    console.warn(...args);
    //필요하면 Sentry.captureMessage 추가
  },

  error: (e: unknown, context?: Record<string, unknown>) => {
    console.error(e, context);
    if (Sentry.isInitialized()) {
      Sentry.captureException(toError(e), {
        extra: { original: e, ...context },
      });
    }
  },

  // 관찰 도구(GA, Mixpanel 등) 연동 시 추가 예정. 예: track(event: string, props?: Record<string, unknown>)
};

// logger.log("Hello, world!");
// logger.warn("Warning: This is a warning!");
// logger.error(new Error("This is an error!"));
// 형식으로 사용할 수 있습니다.
