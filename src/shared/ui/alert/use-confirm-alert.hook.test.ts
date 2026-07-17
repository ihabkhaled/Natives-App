import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as IonicPackage from '@/packages/ionic';

import { useConfirmAlert } from './use-confirm-alert.hook';

interface AlertButtonLike {
  readonly text: string;
  readonly role: string;
  readonly handler: () => void;
}

interface AlertOptionsLike {
  readonly header: string;
  readonly message?: string;
  readonly buttons: readonly AlertButtonLike[];
  readonly onDidDismiss: () => void;
}

const { presentAlert, dismissAlert } = vi.hoisted(() => ({
  presentAlert: vi.fn<(options: unknown) => Promise<void>>(),
  dismissAlert: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/packages/ionic', async (importOriginal) => {
  const actual = await importOriginal<typeof IonicPackage>();
  return { ...actual, useIonAlert: () => [presentAlert, dismissAlert] };
});

function lastAlertOptions(): AlertOptionsLike {
  return presentAlert.mock.calls.at(-1)![0] as AlertOptionsLike;
}

function confirmButton(): AlertButtonLike {
  return lastAlertOptions().buttons.find((button) => button.role === 'confirm')!;
}

function cancelButton(): AlertButtonLike {
  return lastAlertOptions().buttons.find((button) => button.role === 'cancel')!;
}

describe('useConfirmAlert', () => {
  beforeEach(() => {
    presentAlert.mockClear();
  });

  it('presents the header and both labelled buttons', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });

    const options = lastAlertOptions();
    expect(options.header).toBe('Delete item?');
    expect(options.buttons).toHaveLength(2);
    expect(cancelButton().text).toBe('Keep');
    expect(confirmButton().text).toBe('Delete');

    options.onDidDismiss();
    await expect(pending).resolves.toBe(false);
  });

  it('resolves true when the confirm button handler runs', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });
    confirmButton().handler();

    await expect(pending).resolves.toBe(true);
  });

  it('resolves false when the cancel button handler runs', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });
    cancelButton().handler();

    await expect(pending).resolves.toBe(false);
  });

  it('resolves false when the alert is dismissed without a selection', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });
    lastAlertOptions().onDidDismiss();

    await expect(pending).resolves.toBe(false);
  });

  it('keeps the first settled answer when a dismissal follows a confirmation', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });
    confirmButton().handler();
    lastAlertOptions().onDidDismiss();

    await expect(pending).resolves.toBe(true);
  });

  it('passes the message through when one is provided', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });

    expect(lastAlertOptions().message).toBe('This cannot be undone.');

    lastAlertOptions().onDidDismiss();
    await expect(pending).resolves.toBe(false);
  });

  it('omits the message key when none is provided', async () => {
    const { result } = renderHook(() => useConfirmAlert());

    const pending = result.current.confirm({
      header: 'Delete item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });

    expect(Object.keys(lastAlertOptions())).not.toContain('message');

    lastAlertOptions().onDidDismiss();
    await expect(pending).resolves.toBe(false);
  });
});
