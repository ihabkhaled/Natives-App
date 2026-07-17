import { schemaBuilder } from '@/packages/schema';

/** Wire contract for GET /health, shared by remote and mock modes. */
export const healthResponseSchema = schemaBuilder.object({
  status: schemaBuilder.union([schemaBuilder.literal('ok'), schemaBuilder.literal('error')]),
  version: schemaBuilder.string().min(1),
  timestamp: schemaBuilder.iso.datetime({ offset: true }),
});
