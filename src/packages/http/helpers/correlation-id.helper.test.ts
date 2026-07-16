import { describe, expect, it, vi } from 'vitest';

import { createCorrelationId } from './correlation-id.helper';

describe('createCorrelationId', () => {
  it('prefers the platform uuid generator', () => {
    const randomUUID = vi.fn(() => '0b6c9d3a-4f1e-4d5b-9c8a-2e7f6d5c4b3a');

    expect(createCorrelationId({ randomUUID })).toBe('0b6c9d3a-4f1e-4d5b-9c8a-2e7f6d5c4b3a');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('uses the ambient crypto source by default', () => {
    const id = createCorrelationId();

    expect(id).toMatch(/^[0-9a-f-]{36}$/u);
  });

  it('falls back to a timestamped random id without a uuid generator', () => {
    const id = createCorrelationId({});

    expect(id).toMatch(/^req-[0-9a-z]+-[0-9a-z]+$/u);
  });

  it('ignores a non-callable randomUUID', () => {
    const id = createCorrelationId({ randomUUID: undefined });

    expect(id.startsWith('req-')).toBe(true);
  });

  it('produces a distinct id per call in fallback mode', () => {
    const ids = new Set([
      createCorrelationId({}),
      createCorrelationId({}),
      createCorrelationId({}),
    ]);

    expect(ids.size).toBe(3);
  });
});
