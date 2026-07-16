import { describe, expect, it } from 'vitest';

import { safeParseWithSchema, type SchemaIssue } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import { loginFormSchema } from './login-form.schema';

function parseForm(values: {
  readonly email: string;
  readonly password: string;
}): ReturnType<typeof safeParseWithSchema<{ email: string; password: string }, unknown>> {
  return safeParseWithSchema(loginFormSchema, values);
}

function messagesFor(issues: readonly SchemaIssue[], field: string): readonly string[] {
  return issues.filter((issue) => issue.path === field).map((issue) => issue.message);
}

function issuesOf(values: {
  readonly email: string;
  readonly password: string;
}): readonly SchemaIssue[] {
  const result = parseForm(values);
  expect(result.success).toBe(false);
  return result.success ? [] : result.issues;
}

describe('loginFormSchema', () => {
  it('accepts a well-formed credential pair', () => {
    expect(parseForm({ email: 'ranger@example.com', password: 'Sup3rSecret!' })).toEqual({
      success: true,
      data: { email: 'ranger@example.com', password: 'Sup3rSecret!' },
    });
  });

  it('reports the required-email key when the email is empty', () => {
    const issues = issuesOf({ email: '', password: 'Sup3rSecret!' });
    expect(messagesFor(issues, 'email')).toContain(I18N_KEYS.auth.validationEmailRequired);
  });

  it('reports the invalid-email key when the email is malformed', () => {
    const issues = issuesOf({ email: 'ranger@', password: 'Sup3rSecret!' });
    expect(messagesFor(issues, 'email')).toEqual([I18N_KEYS.auth.validationEmailInvalid]);
  });

  it('reports the required-password key when the password is empty', () => {
    const issues = issuesOf({ email: 'ranger@example.com', password: '' });
    expect(messagesFor(issues, 'password')).toContain(I18N_KEYS.auth.validationPasswordRequired);
  });

  it('reports the minimum-length key when the password is too short', () => {
    const issues = issuesOf({ email: 'ranger@example.com', password: 'short' });
    expect(messagesFor(issues, 'password')).toEqual([I18N_KEYS.auth.validationPasswordMin]);
  });

  it('accepts a password of exactly the minimum length', () => {
    expect(parseForm({ email: 'ranger@example.com', password: '12345678' }).success).toBe(true);
  });

  it('surfaces issues for both fields at once', () => {
    const issues = issuesOf({ email: '', password: '' });
    expect(messagesFor(issues, 'email').length).toBeGreaterThan(0);
    expect(messagesFor(issues, 'password').length).toBeGreaterThan(0);
  });

  it('carries i18n keys rather than user-facing copy', () => {
    const issues = issuesOf({ email: 'nope', password: 'short' });
    for (const issue of issues) {
      expect(issue.message.startsWith('auth.validation')).toBe(true);
    }
  });
});
