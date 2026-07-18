/**
 * WCAG 2.2 relative-luminance and contrast-ratio maths. Pure and dependency
 * free so the brand palette can be proven accessible in tests without a
 * browser. Reference: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance.
 */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Minimum contrast for normal-size body text (WCAG AA 1.4.3). */
export const WCAG_AA_NORMAL = 4.5;
/** Minimum contrast for large text and non-text UI (WCAG AA 1.4.3 / 1.4.11). */
export const WCAG_AA_LARGE = 3;

/** Parse a `#RGB` or `#RRGGBB` hex string into 0-255 channels. */
export function hexToRgb(hex: string): Rgb {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const expanded =
    normalized.length === 3
      ? normalized.slice(0, 1).repeat(2) +
        normalized.slice(1, 2).repeat(2) +
        normalized.slice(2, 3).repeat(2)
      : normalized;
  if (expanded.length !== 6) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function channelLuminance(channel: number): number {
  const ratio = channel / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a hex colour in the range 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Contrast ratio between two hex colours (1:1 to 21:1). Order independent. */
export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when the pair meets the given minimum contrast (default: AA normal). */
export function meetsContrast(
  foreground: string,
  background: string,
  minimum: number = WCAG_AA_NORMAL,
): boolean {
  return contrastRatio(foreground, background) >= minimum;
}
