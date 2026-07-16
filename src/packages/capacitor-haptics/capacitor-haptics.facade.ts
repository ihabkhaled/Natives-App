import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const HAPTIC_IMPACT = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
} as const;

export type HapticImpact = (typeof HAPTIC_IMPACT)[keyof typeof HAPTIC_IMPACT];

const IMPACT_STYLE_MAP: Record<HapticImpact, ImpactStyle> = {
  [HAPTIC_IMPACT.Light]: ImpactStyle.Light,
  [HAPTIC_IMPACT.Medium]: ImpactStyle.Medium,
  [HAPTIC_IMPACT.Heavy]: ImpactStyle.Heavy,
};

/** Best-effort haptic feedback; silently unavailable on desktop web. */
export async function triggerHapticImpact(impact: HapticImpact): Promise<void> {
  try {
    await Haptics.impact({ style: IMPACT_STYLE_MAP[impact] });
  } catch {
    // Haptics are unsupported in this runtime; intentionally ignored.
  }
}
