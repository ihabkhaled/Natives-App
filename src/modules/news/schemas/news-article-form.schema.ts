import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import { NEWS_FIELD_LIMITS } from '../news.constants';

const keys = I18N_KEYS.newsEditor;

/**
 * An optional cover image: blank means "no cover", and anything else must be
 * an `https://` URL. Plain `http://` and every other scheme are rejected here
 * because the value ends up as an `<img src>` on a public page — a
 * `javascript:` or `data:` cover is a stored-content attack, not a typo.
 */
const coverImageField = schemaBuilder
  .string()
  .trim()
  .max(NEWS_FIELD_LIMITS.coverImageMax, keys.validationCoverImageTooLong)
  .refine((value) => value === '' || value.startsWith('https://'), keys.validationCoverImageInvalid);

/** An optional backend identifier link (competition or match). */
const linkIdField = schemaBuilder.string().trim().max(NEWS_FIELD_LIMITS.linkIdMax, keys.validationLinkTooLong);

/**
 * Story validation, bounds mirrored from the backend create/update DTO spec
 * for contract 1.8.0, so an author never meets a client rule the server would
 * have accepted (or vice versa). Messages are i18n KEYS, translated by the
 * form hook.
 */
export const newsArticleFormSchema = schemaBuilder.object({
  title: schemaBuilder
    .string()
    .trim()
    .min(NEWS_FIELD_LIMITS.titleMin, keys.validationTitleTooShort)
    .max(NEWS_FIELD_LIMITS.titleMax, keys.validationTitleTooLong),
  body: schemaBuilder
    .string()
    .trim()
    .min(NEWS_FIELD_LIMITS.bodyMin, keys.validationBodyTooShort)
    .max(NEWS_FIELD_LIMITS.bodyMax, keys.validationBodyTooLong),
  coverImageUrl: coverImageField,
  competitionId: linkIdField,
  matchId: linkIdField,
});
