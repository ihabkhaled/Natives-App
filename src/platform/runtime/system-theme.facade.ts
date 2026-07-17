const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function getSystemPrefersDark(): boolean {
  return globalThis.matchMedia(DARK_SCHEME_QUERY).matches;
}

export function subscribeToSystemTheme(onChange: (prefersDark: boolean) => void): () => void {
  const mediaQuery = globalThis.matchMedia(DARK_SCHEME_QUERY);
  const listener = (event: MediaQueryListEvent): void => {
    onChange(event.matches);
  };
  mediaQuery.addEventListener('change', listener);
  return () => {
    mediaQuery.removeEventListener('change', listener);
  };
}
