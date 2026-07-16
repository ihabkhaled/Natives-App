import { safeParseWithSchema, type AppSchema } from '@/packages/schema';

import { HTTP_ERROR_KIND } from '../constants/http-error-kind.constants';
import { HttpError } from '../errors/http.errors';

export function parseResponseWithSchema<T>(schema: AppSchema<T, unknown>, data: unknown): T {
  const parsed = safeParseWithSchema(schema, data);
  if (!parsed.success) {
    const details = parsed.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new HttpError({
      kind: HTTP_ERROR_KIND.ResponseContract,
      message: `Response contract violation. ${details}`,
    });
  }
  return parsed.data;
}
