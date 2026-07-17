import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';
import { useAppToast } from '@/shared/ui';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { WORKBENCH_LIST_SIZE } from '../constants/workbench.constants';
import { useWorkbenchScreen, type WorkbenchScreenView } from './use-workbench-screen.hook';

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const VALID = { name: 'Ranger', email: 'ranger@example.com' };

const showToast = vi.fn<() => Promise<void>>();

async function submitValidForm(result: { current: WorkbenchScreenView }): Promise<void> {
  act(() => {
    result.current.form.name.onChange(VALID.name);
  });
  act(() => {
    result.current.form.email.onChange(VALID.email);
  });
  await act(async () => {
    result.current.form.onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue();
  vi.mocked(useAppToast).mockReturnValue({ showToast });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useWorkbenchScreen', () => {
  it('exposes the screen and section headings as translated English copy', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.title).toBe('UI Workbench');
    expect(result.current.buttonsSection).toBe('Buttons');
    expect(result.current.formSection).toBe('Form');
    expect(result.current.statesSection).toBe('States');
    expect(result.current.listSection).toBe('Virtualized list');
  });

  it('exposes the button labels as translated English copy', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.buttonPrimary).toBe('Primary action');
    expect(result.current.buttonSecondary).toBe('Secondary action');
    expect(result.current.buttonDanger).toBe('Destructive action');
  });

  it('exposes the form labels as translated English copy', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.formNameLabel).toBe('Name');
    expect(result.current.formEmailLabel).toBe('Email');
    expect(result.current.formSubmit).toBe('Submit');
  });

  it('exposes every state label as translated English copy', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.stateLabels).toEqual({
      loading: 'Loading…',
      emptyTitle: 'Nothing here yet',
      emptyMessage: 'There is no content to show right now.',
      errorTitle: 'Something went wrong',
      retry: 'Try again',
      offlineTitle: 'You are offline',
      offlineMessage: 'Reconnect to load the latest data.',
      permissionTitle: 'Permission needed',
      permissionMessage: 'Grant the required permission to use this feature.',
    });
  });

  it('builds the full demo dataset with translated, interpolated labels', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.items).toHaveLength(WORKBENCH_LIST_SIZE);
    expect(result.current.items[0]).toEqual({
      id: 'workbench-item-0',
      index: 0,
      label: 'Item 0',
    });
    expect(result.current.items.at(-1)).toMatchObject({ index: 499, label: 'Item 499' });
  });

  it('exposes the form view model', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.form.name.name).toBe('name');
    expect(result.current.form.email.name).toBe('email');
  });

  it('shows no success message before anything is submitted', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    expect(result.current.formSuccessMessage).toBeUndefined();
  });

  it('interpolates the submitted name into the success message', async () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    await submitValidForm(result);

    expect(result.current.formSuccessMessage).toBe('Submitted as Ranger');
  });

  it('leaves the success message undefined when the submission is invalid', async () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(result.current.formSuccessMessage).toBeUndefined();
    expect(result.current.form.name.errorMessage).toBe('Name is required.');
  });

  it('presents a toast through the toast owner when the retry demo runs', () => {
    const { result } = renderHook(() => useWorkbenchScreen());

    act(() => {
      result.current.onStateRetryDemo();
    });

    expect(showToast).toHaveBeenCalledExactlyOnceWith({ message: 'Try again', tone: 'neutral' });
  });
});
