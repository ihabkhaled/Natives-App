import { z } from 'zod';

/**
 * Wire primitives every module schema reuses: ISO instants, ISO dates, and
 * the bounded-page envelope the API returns for every list.
 */
export const isoInstantField = z.iso.datetime({ offset: true });

export const isoDateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

export const pagedEnvelopeFields = {
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
} as const;
