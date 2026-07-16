export type RawEnvironmentSource = Readonly<Record<string, unknown>>;

export interface AppEnvironment {
  readonly appName: string;
  readonly appId: string;
  readonly apiBaseUrl: string;
  readonly apiMode: 'mock' | 'remote';
  readonly apiTimeoutMs: number;
  readonly defaultLocale: string;
  readonly supportedLocales: readonly string[];
  readonly defaultTheme: 'light' | 'dark' | 'system';
  readonly sentryDsn: string | undefined;
  readonly socketUrl: string | undefined;
  readonly enableQueryDevtools: boolean;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly mode: string;
}
