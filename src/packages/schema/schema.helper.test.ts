import { describe, expect, it } from 'vitest';

import { schemaBuilder } from '@/packages/schema';

import { safeParseWithSchema } from './schema.helper';

const userSchema = schemaBuilder.object({
  name: schemaBuilder.string(),
  address: schemaBuilder.object({ city: schemaBuilder.string() }),
});

describe('safeParseWithSchema', () => {
  it('returns the parsed data on success', () => {
    const result = safeParseWithSchema(userSchema, { name: 'Sam', address: { city: 'Cairo' } });

    expect(result).toEqual({ success: true, data: { name: 'Sam', address: { city: 'Cairo' } } });
  });

  it('returns the schema output rather than the raw input on success', () => {
    const trimmed = schemaBuilder.string().transform((value) => value.trim());

    const result = safeParseWithSchema(trimmed, '  padded  ');

    expect(result.success && result.data).toBe('padded');
  });

  it('flattens issue paths with dots so callers can address nested fields', () => {
    const result = safeParseWithSchema(userSchema, { name: 'Sam', address: { city: 42 } });

    expect(result.success).toBe(false);
    const issues = result.success ? [] : result.issues;
    expect(issues.map((issue) => issue.path)).toEqual(['address.city']);
    expect(issues[0]?.message).toBeTypeOf('string');
  });

  it('reports every issue with a readable message', () => {
    const result = safeParseWithSchema(userSchema, { name: 1, address: { city: 2 } });

    const issues = result.success ? [] : result.issues;
    expect(issues.map((issue) => issue.path)).toEqual(['name', 'address.city']);
    for (const issue of issues) {
      expect(issue.message.length).toBeGreaterThan(0);
    }
  });

  it('renders array indices as path segments', () => {
    const listSchema = schemaBuilder.object({ tags: schemaBuilder.array(schemaBuilder.string()) });

    const result = safeParseWithSchema(listSchema, { tags: ['ok', 7] });

    expect(result.success ? [] : result.issues.map((issue) => issue.path)).toEqual(['tags.1']);
  });

  it('reports a root-level issue with an empty path', () => {
    const result = safeParseWithSchema(userSchema, 'not-an-object');

    expect(result.success ? [] : result.issues.map((issue) => issue.path)).toEqual(['']);
  });
});
