import { schemaBuilder } from '@/packages/schema';

/** NestJS error envelope (see blueprints in docs/api/nest-error-contract.md). */
export const nestErrorEnvelopeSchema = schemaBuilder.object({
  statusCode: schemaBuilder.number().int(),
  code: schemaBuilder.string().optional(),
  message: schemaBuilder.union([schemaBuilder.string(), schemaBuilder.array(schemaBuilder.string())]).optional(),
  errors: schemaBuilder
    .array(
      schemaBuilder.object({
        field: schemaBuilder.string(),
        code: schemaBuilder.string(),
        message: schemaBuilder.string().optional(),
      }),
    )
    .optional(),
  path: schemaBuilder.string().optional(),
  timestamp: schemaBuilder.string().optional(),
  requestId: schemaBuilder.string().optional(),
});

/** RFC 9457 problem-details compatibility. */
export const problemDetailsSchema = schemaBuilder.object({
  type: schemaBuilder.string().optional(),
  title: schemaBuilder.string().optional(),
  status: schemaBuilder.number().int(),
  detail: schemaBuilder.string().optional(),
  instance: schemaBuilder.string().optional(),
});
