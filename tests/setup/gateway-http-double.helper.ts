import { vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

/** The mocked verbs a gateway spec asserts against. */
export interface GatewayHttpDouble {
  readonly get: ReturnType<typeof vi.fn>;
  readonly post: ReturnType<typeof vi.fn>;
}

/**
 * The `get`/`post` double every gateway spec drives `getAppHttpClient` with.
 *
 * Five specs carried a byte-identical copy of this setup. The caller must
 * still `vi.mock('@/packages/http', ...)` at module scope — that hoisting
 * cannot be shared — and then call `resetGatewayHttpDouble()` from its own
 * `beforeEach`.
 */
export const gatewayHttp: GatewayHttpDouble = {
  get: vi.fn(),
  post: vi.fn(),
};

/** Clears every mock and re-points `getAppHttpClient` at the double. */
export function resetGatewayHttpDouble(): void {
  vi.clearAllMocks();
  gatewayHttp.get.mockResolvedValue({});
  gatewayHttp.post.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue(gatewayHttp as never);
}
