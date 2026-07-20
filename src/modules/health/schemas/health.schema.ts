import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for GET /health, shared by remote and mock modes.
 *
 * The deployed NestJS probe answers `{ status, uptimeSeconds, timestamp }` and
 * does not carry a build version, so `version` is optional here and the card
 * simply omits the row when the server does not report one.
 */
export const healthResponseSchema = schemaBuilder.object({
  status: schemaBuilder.union([schemaBuilder.literal('ok'), schemaBuilder.literal('error')]),
  version: schemaBuilder.string().min(1).optional(),
  uptimeSeconds: schemaBuilder.number().nonnegative().optional(),
  timestamp: schemaBuilder.iso.datetime({ offset: true }),
});
