import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HAPTIC_IMPACT, triggerHapticImpact } from './capacitor-haptics.facade';

const { impact } = vi.hoisted(() => ({
  impact: vi.fn<(options: { style: string }) => Promise<void>>(),
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HAPTIC_IMPACT', () => {
  it('names the supported impact strengths', () => {
    expect(HAPTIC_IMPACT).toEqual({ Light: 'light', Medium: 'medium', Heavy: 'heavy' });
  });
});

describe('triggerHapticImpact', () => {
  it.each([
    [HAPTIC_IMPACT.Light, 'LIGHT'],
    [HAPTIC_IMPACT.Medium, 'MEDIUM'],
    [HAPTIC_IMPACT.Heavy, 'HEAVY'],
  ])('maps the %s impact onto the plugin style', async (appImpact, pluginStyle) => {
    await triggerHapticImpact(appImpact);

    expect(impact).toHaveBeenCalledExactlyOnceWith({ style: pluginStyle });
  });

  it('stays silent when haptics are unsupported', async () => {
    impact.mockRejectedValue(new Error('not implemented on web'));

    await expect(triggerHapticImpact(HAPTIC_IMPACT.Light)).resolves.toBeUndefined();
  });
});
