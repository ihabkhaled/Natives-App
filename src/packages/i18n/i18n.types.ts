export type TranslationResources = Record<string, { readonly translation: Record<string, unknown> }>;

export interface InitI18nOptions {
  readonly resources: TranslationResources;
  readonly defaultLocale: string;
  readonly supportedLocales: readonly string[];
}

export type TranslateParams = Record<string, string | number>;

export interface AppTranslation {
  readonly t: (key: string, params?: TranslateParams) => string;
  readonly locale: string;
}
