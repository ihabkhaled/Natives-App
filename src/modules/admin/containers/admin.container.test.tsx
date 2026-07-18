import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { AdminContainer } from './admin.container';

beforeAll(async () => {
  await initTestI18n();
});

describe('AdminContainer', () => {
  it('renders the admin page shell with its translated console heading', () => {
    render(<AdminContainer />);

    expect(screen.getByTestId(TEST_IDS.adminPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admin console' })).toBeInTheDocument();
  });
});
