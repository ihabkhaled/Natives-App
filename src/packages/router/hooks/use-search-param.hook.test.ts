import { describe, expect, it } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

import { useSearchParam } from './use-search-param.hook';

function renderSearchParam(name: string, initialPath: string) {
  return renderHookWithProviders(() => useSearchParam(name), { initialPath });
}

describe('useSearchParam', () => {
  it('returns the value of a present query parameter', () => {
    const { result } = renderSearchParam('token', '/reset-password?token=abc123');

    expect(result.current).toBe('abc123');
  });

  it('returns null when the parameter is absent', () => {
    const { result } = renderSearchParam('token', '/reset-password?other=1');

    expect(result.current).toBeNull();
  });

  it('returns null when the URL carries no query string', () => {
    const { result } = renderSearchParam('token', '/reset-password');

    expect(result.current).toBeNull();
  });

  it('decodes percent-encoded values', () => {
    const { result } = renderSearchParam('token', '/reset-password?token=a%20b');

    expect(result.current).toBe('a b');
  });
});
