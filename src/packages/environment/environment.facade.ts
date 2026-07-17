import { createEnvironment } from './environment.factory';
import type { AppEnvironment } from './environment.types';

let cachedEnvironment: AppEnvironment | null = null;

/**
 * The only place in the application allowed to read import.meta.env
 * (ESLint: architecture/no-import-meta-env-outside-environment).
 */
export function getEnvironment(): AppEnvironment {
  cachedEnvironment ??= createEnvironment(import.meta.env);
  return cachedEnvironment;
}

export function resetEnvironmentCacheForTesting(): void {
  cachedEnvironment = null;
}
