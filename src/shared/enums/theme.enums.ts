export const THEME_MODE = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const;

export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

export const THEME_MODES: readonly ThemeMode[] = Object.values(THEME_MODE);
