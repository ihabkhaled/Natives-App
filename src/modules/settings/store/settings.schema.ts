import { schemaBuilder } from '@/packages/schema';
import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

/** Shape of the persisted (non-sensitive) settings payload, version 1. */
export const persistedSettingsSchema = schemaBuilder.object({
  theme: schemaBuilder.union([
    schemaBuilder.literal(THEME_MODE.Light),
    schemaBuilder.literal(THEME_MODE.Dark),
    schemaBuilder.literal(THEME_MODE.System),
  ]),
  locale: schemaBuilder.union([
    schemaBuilder.literal(APP_LOCALE.English),
    schemaBuilder.literal(APP_LOCALE.Arabic),
  ]),
});
