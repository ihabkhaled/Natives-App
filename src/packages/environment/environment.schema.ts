import { schemaBuilder } from '@/packages/schema';

const optionalUrl = schemaBuilder
  .union([schemaBuilder.literal(''), schemaBuilder.url()])
  .default('')
  .transform((value) => (value === '' ? undefined : value));

const booleanFlag = schemaBuilder
  .union([schemaBuilder.literal('true'), schemaBuilder.literal('false')])
  .default('false')
  .transform((value) => value === 'true');

const csvLocales = schemaBuilder
  .string()
  .min(1)
  .transform((value) => value.split(',').map((locale) => locale.trim()))
  .pipe(schemaBuilder.array(schemaBuilder.string().min(2)).min(1));

export const rawEnvironmentSchema = schemaBuilder.object({
  VITE_APP_NAME: schemaBuilder.string().min(1),
  VITE_APP_ID: schemaBuilder.string().regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/u),
  VITE_API_BASE_URL: schemaBuilder.url(),
  VITE_API_MODE: schemaBuilder.union([
    schemaBuilder.literal('mock'),
    schemaBuilder.literal('remote'),
  ]),
  VITE_API_TIMEOUT_MS: schemaBuilder.coerce.number().int().positive().max(120_000),
  VITE_DEFAULT_LOCALE: schemaBuilder.string().min(2),
  VITE_SUPPORTED_LOCALES: csvLocales,
  VITE_DEFAULT_THEME: schemaBuilder.union([
    schemaBuilder.literal('light'),
    schemaBuilder.literal('dark'),
    schemaBuilder.literal('system'),
  ]),
  VITE_SENTRY_DSN: optionalUrl,
  VITE_SOCKET_URL: optionalUrl,
  VITE_ENABLE_QUERY_DEVTOOLS: booleanFlag,
  DEV: schemaBuilder.boolean().default(false),
  PROD: schemaBuilder.boolean().default(false),
  MODE: schemaBuilder.string().default('development'),
});
