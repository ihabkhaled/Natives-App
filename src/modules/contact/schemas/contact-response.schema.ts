import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for a successful `POST /contact` (201). The backend documents
 * `sent` as "always true on a 201", so it is parsed as a literal: a body that
 * says anything else is a contract violation, and the visitor is told the
 * message was not confirmed rather than shown a success the server never
 * claimed.
 */
export const contactResponseSchema = schemaBuilder.object({
  sent: schemaBuilder.literal(true),
});
