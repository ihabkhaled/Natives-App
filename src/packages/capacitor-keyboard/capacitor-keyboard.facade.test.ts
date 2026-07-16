import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hideKeyboard } from './capacitor-keyboard.facade';

const { hide } = vi.hoisted(() => ({ hide: vi.fn<() => Promise<void>>() }));

vi.mock('@capacitor/keyboard', () => ({ Keyboard: { hide } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hideKeyboard', () => {
  it('asks the plugin to dismiss the keyboard', async () => {
    await hideKeyboard();

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('resolves quietly when the plugin is unavailable', async () => {
    hide.mockRejectedValue(new Error('not implemented on web'));

    await expect(hideKeyboard()).resolves.toBeUndefined();
  });
});
