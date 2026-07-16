import type { z } from 'zod';

import type { AppSchema, SchemaIssue, SchemaParseResult } from './schema.types';

function toSchemaIssue(issue: z.core.$ZodIssue): SchemaIssue {
  return {
    path: issue.path.map(String).join('.'),
    message: issue.message,
  };
}

export function safeParseWithSchema<Output, Input>(
  schema: AppSchema<Output, Input>,
  value: unknown,
): SchemaParseResult<Output> {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, issues: result.error.issues.map(toSchemaIssue) };
}
