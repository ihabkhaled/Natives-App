import { setupWorker } from 'msw/browser';

import { mockApiHandlers } from './handlers';

/**
 * Browser worker for mock mode. Started only by app startup, only when
 * VITE_API_MODE=mock and never in production builds.
 */
export async function startMockWorker(): Promise<void> {
  const worker = setupWorker(...mockApiHandlers);
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}
