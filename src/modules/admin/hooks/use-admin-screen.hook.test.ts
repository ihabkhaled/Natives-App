import { renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useAdminScreen } from './use-admin-screen.hook';

beforeAll(async () => {
  await initTestI18n();
});

describe('useAdminScreen', () => {
  it('prepares the translated title, heading, and description', () => {
    const { result } = renderHook(() => useAdminScreen());

    expect(result.current.title).toBe('Admin');
    expect(result.current.heading).toBe('Admin console');
    expect(result.current.description.length).toBeGreaterThan(0);
  });
});
