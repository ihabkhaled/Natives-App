import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyStatusBarAppearance, STATUS_BAR_APPEARANCE } from './capacitor-status-bar.facade';

const { setStyle } = vi.hoisted(() => ({
  setStyle: vi.fn<(options: { style: string }) => Promise<void>>(),
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle },
  Style: { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('STATUS_BAR_APPEARANCE', () => {
  it('names the supported appearances', () => {
    expect(STATUS_BAR_APPEARANCE).toEqual({ Light: 'light', Dark: 'dark' });
  });
});

describe('applyStatusBarAppearance', () => {
  it('asks for the dark plugin style on a dark appearance', async () => {
    await applyStatusBarAppearance(STATUS_BAR_APPEARANCE.Dark);

    expect(setStyle).toHaveBeenCalledExactlyOnceWith({ style: 'DARK' });
  });

  it('asks for the light plugin style on a light appearance', async () => {
    await applyStatusBarAppearance(STATUS_BAR_APPEARANCE.Light);

    expect(setStyle).toHaveBeenCalledExactlyOnceWith({ style: 'LIGHT' });
  });

  it('stays silent when the status bar is unavailable', async () => {
    setStyle.mockRejectedValue(new Error('not implemented on web'));

    await expect(applyStatusBarAppearance(STATUS_BAR_APPEARANCE.Dark)).resolves.toBeUndefined();
  });
});
