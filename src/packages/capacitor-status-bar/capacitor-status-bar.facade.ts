import { StatusBar, Style } from '@capacitor/status-bar';

export const STATUS_BAR_APPEARANCE = {
  Light: 'light',
  Dark: 'dark',
} as const;

export type StatusBarAppearance =
  (typeof STATUS_BAR_APPEARANCE)[keyof typeof STATUS_BAR_APPEARANCE];

/** Align status-bar content color with the active theme; a web no-op. */
export async function applyStatusBarAppearance(appearance: StatusBarAppearance): Promise<void> {
  try {
    await StatusBar.setStyle({
      style: appearance === STATUS_BAR_APPEARANCE.Dark ? Style.Dark : Style.Light,
    });
  } catch {
    // The status bar is unavailable in this runtime; intentionally ignored.
  }
}
