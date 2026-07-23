import type { SchemaIssue } from '@/packages/schema';

import {
  CONSTRAINT_FALLBACK_KEY,
  CONSTRAINT_LABEL_KEYS,
  SUBJECT_CONSTRAINT_LABEL_KEYS,
} from '../constants/setting-editor-labels.constants';
import { ISSUE_SUBJECT_SEPARATOR } from '../constants/setting-values.constants';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * Translate schema issues into user copy. Messages carry the backend's
 * machine constraint codes; anything else (a zod type error) falls back to
 * the generic contract-mismatch line. Deduplicated: ten duplicate codes are
 * one instruction, not ten.
 */
export function describeValidationIssues(
  t: Translate,
  issues: readonly SchemaIssue[],
): readonly string[] {
  const described = issues.map((issue) => {
    const labelKey = CONSTRAINT_LABEL_KEYS[issue.message];
    return labelKey === undefined ? t(CONSTRAINT_FALLBACK_KEY) : t(labelKey);
  });
  return [...new Set(described)];
}

/**
 * Translate one snapshot issue code (`weights_missing_status:absent`) into
 * copy; unknown codes render through the generic fallback so a newer backend
 * never leaves an untranslated token on screen.
 */
export function describeSnapshotIssue(t: Translate, issue: string): string {
  const separator = issue.indexOf(ISSUE_SUBJECT_SEPARATOR);
  const code = separator === -1 ? issue : issue.slice(0, separator);
  const subject = separator === -1 ? '' : issue.slice(separator + 1);
  const subjectKey = SUBJECT_CONSTRAINT_LABEL_KEYS[code];
  if (subjectKey !== undefined) {
    return t(subjectKey, { code: subject });
  }
  const plainKey = CONSTRAINT_LABEL_KEYS[code];
  return plainKey === undefined ? t(CONSTRAINT_FALLBACK_KEY) : t(plainKey);
}
