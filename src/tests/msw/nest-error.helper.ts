import { HttpResponse } from 'msw';

interface NestErrorOptions {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly path: string;
  /** The backend translation key the client maps to its own copy. */
  readonly messageKey?: string;
  readonly errors?: readonly { field: string; code: string; message: string }[];
}

/** Build a NestJS-shaped error envelope (docs/api/nest-error-contract.md). */
export function nestErrorResponse(options: NestErrorOptions): Response {
  return HttpResponse.json(
    {
      statusCode: options.statusCode,
      code: options.code,
      message: options.message,
      ...(options.messageKey === undefined ? {} : { messageKey: options.messageKey }),
      errors: options.errors ?? [],
      path: options.path,
      timestamp: '2026-07-16T12:00:00.000Z',
      requestId: `mock-${options.code.toLowerCase()}`,
    },
    { status: options.statusCode },
  );
}
