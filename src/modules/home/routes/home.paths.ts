import { APP_PATHS } from '@/shared/config';

/** The public marketing landing page — the app's front door at `/`. */
export function rootPath(): string {
  return APP_PATHS.root;
}

export function welcomePath(): string {
  return APP_PATHS.welcome;
}

export function homePath(): string {
  return APP_PATHS.home;
}

export function aboutPath(): string {
  return APP_PATHS.about;
}
