import { describe, expect, it } from 'vitest';

import { schemaBuilder } from '@/packages/schema';

import { HTTP_ERROR_KIND } from '../constants/http-error-kind.constants';
import { HttpError } from '../errors/http.errors';
import { parseResponseWithSchema } from './parse-response.helper';

const userSchema = schemaBuilder.object({
  id: schemaBuilder.string(),
  age: schemaBuilder.number(),
});

describe('parseResponseWithSchema', () => {
  it('returns the parsed body on a contract match', () => {
    expect(parseResponseWithSchema(userSchema, { id: 'u-1', age: 30 })).toEqual({
      id: 'u-1',
      age: 30,
    });
  });

  it('returns the schema output rather than the raw body', () => {
    const trimmed = schemaBuilder.object({ id: schemaBuilder.string().trim() });

    expect(parseResponseWithSchema(trimmed, { id: '  u-1  ' })).toEqual({ id: 'u-1' });
  });

  it('throws a response-contract error when the body violates the schema', () => {
    expect(() => parseResponseWithSchema(userSchema, { id: 'u-1', age: 'thirty' })).toThrow(
      HttpError,
    );
  });

  it('tags the failure with the response-contract kind', () => {
    const failure = (() => {
      try {
        parseResponseWithSchema(userSchema, {});
        return null;
      } catch (error: unknown) {
        return error;
      }
    })();

    expect(failure).toBeInstanceOf(HttpError);
    expect(failure).toMatchObject({ kind: HTTP_ERROR_KIND.ResponseContract, status: undefined });
  });

  it('names the offending fields in the message', () => {
    expect(() => parseResponseWithSchema(userSchema, { id: 1, age: 'thirty' })).toThrow(
      /Response contract violation\..*id.*age/su,
    );
  });

  it('rejects a null body for an object contract', () => {
    expect(() => parseResponseWithSchema(userSchema, null)).toThrow(HttpError);
  });
});
