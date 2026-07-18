import { renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useRouteParam } from './use-route-param.hook';

function renderRouteParam(name: string, pattern: string, initialPath: string) {
  function Wrapper(props: { readonly children: ReactNode }): ReactElement {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Route path={pattern}>{props.children}</Route>
      </MemoryRouter>
    );
  }
  return renderHook(() => useRouteParam(name), { wrapper: Wrapper });
}

describe('useRouteParam', () => {
  it('returns the value of a matched path parameter', () => {
    const { result } = renderRouteParam('sessionId', '/practices/:sessionId', '/practices/sess-7');

    expect(result.current).toBe('sess-7');
  });

  it('returns null when the parameter is absent from the pattern', () => {
    const { result } = renderRouteParam('sessionId', '/practices', '/practices');

    expect(result.current).toBeNull();
  });
});
