import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppLifecycle } from './app-lifecycle.provider';
import { useAppLifecycle } from './use-app-lifecycle.hook';

vi.mock('./use-app-lifecycle.hook', () => ({ useAppLifecycle: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('AppLifecycle', () => {
  it('renders nothing', () => {
    const { container } = render(<AppLifecycle />);

    expect(container).toBeEmptyDOMElement();
  });

  it('owns the native lifecycle listeners', () => {
    render(<AppLifecycle />);

    expect(useAppLifecycle).toHaveBeenCalledOnce();
  });
});
