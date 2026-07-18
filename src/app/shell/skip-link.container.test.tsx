import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../tests/setup/i18n-test.helper';
import { SkipLink } from './skip-link.container';

beforeAll(async () => {
  await initTestI18n();
});

describe('SkipLink', () => {
  it('links to the main-content landmark with translated copy', () => {
    render(<SkipLink />);

    const link = screen.getByTestId(TEST_IDS.skipLink);
    expect(link).toHaveTextContent('Skip to main content');
    expect(link).toHaveAttribute('href', `#${TEST_IDS.mainContent}`);
  });
});
