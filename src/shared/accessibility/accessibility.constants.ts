/** WCAG 2.2 AA practical minimum touch target, in CSS pixels. */
export const MIN_TOUCH_TARGET_PX = 44;

export const ARIA_LIVE = {
  Polite: 'polite',
  Assertive: 'assertive',
} as const;

export type AriaLivePoliteness = (typeof ARIA_LIVE)[keyof typeof ARIA_LIVE];
