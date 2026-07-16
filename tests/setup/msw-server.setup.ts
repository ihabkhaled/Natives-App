import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { mockApiHandlers, resetMockAuthState } from '@/tests/msw/handlers';

/** Node-side MSW server shared by integration and contract projects. */
export const mockApiServer = setupServer(...mockApiHandlers);

beforeAll(() => {
  mockApiServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  mockApiServer.resetHandlers();
  resetMockAuthState();
});

afterAll(() => {
  mockApiServer.close();
});
