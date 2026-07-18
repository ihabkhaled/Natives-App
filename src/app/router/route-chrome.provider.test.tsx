import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../tests/setup/i18n-test.helper';
import { RouteChrome } from './route-chrome.provider';

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  document.title = '';
});

describe('RouteChrome', () => {
  it('renders nothing but applies the active route title', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <RouteChrome />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(document.title).toBe('Home');
  });
});
