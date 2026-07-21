import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { nestErrorEnvelopeSchema, problemDetailsSchema } from './api-error.schema';

describe('nestErrorEnvelopeSchema', () => {
  it('accepts a minimal envelope', () => {
    const result = safeParseWithSchema(nestErrorEnvelopeSchema, { statusCode: 500 });

    expect(result).toEqual({ success: true, data: { statusCode: 500 } });
  });

  it('accepts a full validation envelope', () => {
    const envelope = {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      messageKey: 'errors.validation.failed',
      message: 'Validation failed',
      errors: [{ field: 'email', code: 'INVALID_EMAIL', message: 'bad' }],
      path: '/api/v1/things',
      timestamp: '2024-03-15T10:30:00.000Z',
      requestId: 'req-9',
    };

    expect(safeParseWithSchema(nestErrorEnvelopeSchema, envelope)).toEqual({
      success: true,
      data: envelope,
    });
  });

  it('carries the backend messageKey when present', () => {
    const result = safeParseWithSchema(nestErrorEnvelopeSchema, {
      statusCode: 409,
      messageKey: 'errors.members.accountRequired',
    });

    expect(result).toEqual({
      success: true,
      data: { statusCode: 409, messageKey: 'errors.members.accountRequired' },
    });
  });

  it('accepts the array form of message that nest emits', () => {
    const result = safeParseWithSchema(nestErrorEnvelopeSchema, {
      statusCode: 400,
      message: ['name must not be empty', 'email must be an email'],
    });

    expect(result.success).toBe(true);
  });

  it('accepts field errors without a message', () => {
    const result = safeParseWithSchema(nestErrorEnvelopeSchema, {
      statusCode: 400,
      errors: [{ field: 'email', code: 'INVALID_EMAIL' }],
    });

    expect(result.success).toBe(true);
  });

  it('requires a status code', () => {
    expect(safeParseWithSchema(nestErrorEnvelopeSchema, { code: 'NOPE' }).success).toBe(false);
  });

  it('requires an integer status code', () => {
    expect(safeParseWithSchema(nestErrorEnvelopeSchema, { statusCode: 400.5 }).success).toBe(false);
  });

  it('rejects a field error without a code', () => {
    expect(
      safeParseWithSchema(nestErrorEnvelopeSchema, {
        statusCode: 400,
        errors: [{ field: 'email' }],
      }).success,
    ).toBe(false);
  });

  it('rejects a non-object body', () => {
    expect(safeParseWithSchema(nestErrorEnvelopeSchema, 'gateway exploded').success).toBe(false);
  });
});

describe('problemDetailsSchema', () => {
  it('accepts a minimal problem', () => {
    expect(safeParseWithSchema(problemDetailsSchema, { status: 404 })).toEqual({
      success: true,
      data: { status: 404 },
    });
  });

  it('accepts a full problem', () => {
    const problem = {
      type: 'https://example.com/not-found',
      title: 'Resource not found',
      status: 404,
      detail: 'No such thing',
      instance: '/api/v1/things/1',
    };

    expect(safeParseWithSchema(problemDetailsSchema, problem)).toEqual({
      success: true,
      data: problem,
    });
  });

  it('requires a status', () => {
    expect(safeParseWithSchema(problemDetailsSchema, { title: 'Resource not found' }).success).toBe(
      false,
    );
  });

  it('rejects a non-integer status', () => {
    expect(safeParseWithSchema(problemDetailsSchema, { status: 404.5 }).success).toBe(false);
  });
});
