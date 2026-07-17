import { afterEach, describe, expect, it, vi } from 'vitest';

import { reloadApplication } from './app-reload.facade';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reloadApplication', () => {
  it('reloads the document through the location API', () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { reload });

    reloadApplication();

    expect(reload).toHaveBeenCalledOnce();
  });

  it('reloads once per call', () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { reload });

    reloadApplication();
    reloadApplication();

    expect(reload).toHaveBeenCalledTimes(2);
  });
});
