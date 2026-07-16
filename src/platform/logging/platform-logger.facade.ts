import { createConsoleSink, createLogger, type AppLogger } from '@/packages/logger';

const loggerCache = new Map<string, AppLogger>();

/** Scoped application logger with a memoized console sink. */
export function getPlatformLogger(scope: string): AppLogger {
  const cached = loggerCache.get(scope);
  if (cached !== undefined) {
    return cached;
  }
  const logger = createLogger(scope, createConsoleSink());
  loggerCache.set(scope, logger);
  return logger;
}
