import { describe, expect, it } from 'vitest';

import { safeParseWithSchema, type SchemaIssue } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import type { WorkbenchFormValues } from '../types/workbench.types';
import { workbenchFormSchema } from './workbench-form.schema';

function parseForm(values: WorkbenchFormValues): ReturnType<typeof safeParseWithSchema> {
  return safeParseWithSchema(workbenchFormSchema, values);
}

function issuesOf(values: WorkbenchFormValues): readonly SchemaIssue[] {
  const result = parseForm(values);
  expect(result.success).toBe(false);
  return result.success ? [] : result.issues;
}

function messagesFor(issues: readonly SchemaIssue[], field: string): readonly string[] {
  return issues.filter((issue) => issue.path === field).map((issue) => issue.message);
}

describe('workbenchFormSchema', () => {
  it('accepts a well-formed submission', () => {
    expect(parseForm({ name: 'Ranger', email: 'ranger@example.com' })).toEqual({
      success: true,
      data: { name: 'Ranger', email: 'ranger@example.com' },
    });
  });

  it('reports the required-name key when the name is empty', () => {
    const issues = issuesOf({ name: '', email: 'ranger@example.com' });

    expect(messagesFor(issues, 'name')).toEqual([I18N_KEYS.workbench.formValidationNameRequired]);
  });

  it('reports the invalid-email key when the email is empty', () => {
    const issues = issuesOf({ name: 'Ranger', email: '' });

    expect(messagesFor(issues, 'email')).toContain(I18N_KEYS.workbench.formValidationEmailInvalid);
  });

  it('reports the invalid-email key when the email is malformed', () => {
    const issues = issuesOf({ name: 'Ranger', email: 'ranger@' });

    expect(messagesFor(issues, 'email')).toEqual([I18N_KEYS.workbench.formValidationEmailInvalid]);
  });

  it('surfaces issues for both fields at once', () => {
    const issues = issuesOf({ name: '', email: 'nope' });

    expect(messagesFor(issues, 'name')).toHaveLength(1);
    expect(messagesFor(issues, 'email')).toHaveLength(1);
  });

  it('rejects a non-string name', () => {
    expect(safeParseWithSchema(workbenchFormSchema, { name: 7, email: 'a@b.co' }).success).toBe(
      false,
    );
  });

  it('rejects a payload that is not an object', () => {
    expect(safeParseWithSchema(workbenchFormSchema, null).success).toBe(false);
  });

  it('carries i18n keys rather than user-facing copy', () => {
    for (const issue of issuesOf({ name: '', email: 'nope' })) {
      expect(issue.message.startsWith('workbench.formValidation')).toBe(true);
    }
  });
});
