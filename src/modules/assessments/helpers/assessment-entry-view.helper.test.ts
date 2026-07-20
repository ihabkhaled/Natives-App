import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import {
  buildAssessmentCatalog,
  buildAssessmentDetail,
  buildAssessmentSummary,
} from '../../../../tests/factories/assessments.factory';
import {
  buildCompleteness,
  buildEntryGroups,
  buildEntryHeader,
  buildGridCopy,
  buildRevisionViews,
  buildWorkflowActions,
  resolveEntryStatus,
  resolveTemplateMetricIds,
} from './assessment-entry-view.helper';

const t = (key: string): string => key;
const CATALOG = buildAssessmentCatalog();
const DETAIL = buildAssessmentDetail();

const BASE_STATUS = {
  isForbidden: false,
  isMissing: false,
  hasDetail: false,
  hasCatalog: false,
  isLoading: false,
  hasError: false,
  isOffline: false,
};

describe('resolveEntryStatus', () => {
  it('needs both the record and the catalog before it is ready', () => {
    expect(resolveEntryStatus({ ...BASE_STATUS, hasDetail: true, hasCatalog: true })).toBe('ready');
    expect(resolveEntryStatus({ ...BASE_STATUS, hasDetail: true, isLoading: true })).toBe(
      'loading',
    );
  });

  it('presents a missing record as its own state', () => {
    expect(resolveEntryStatus({ ...BASE_STATUS, isMissing: true, hasError: true })).toBe('empty');
  });
});

describe('buildEntryHeader', () => {
  it('returns quiet defaults before the record resolves', () => {
    expect(buildEntryHeader(t, undefined)).toEqual({
      statusLabel: '',
      statusTone: 'medium',
      revisionLabel: '',
      playerLabel: '',
      readOnlyLabel: '',
      isEditable: false,
    });
  });

  it('marks a draft editable with no read-only notice', () => {
    const header = buildEntryHeader(t, DETAIL);

    expect(header.isEditable).toBe(true);
    expect(header.readOnlyLabel).toBe('');
    expect(header.statusLabel).toBe('assessments.statusDraft');
  });

  it('marks a published revision read-only', () => {
    const header = buildEntryHeader(t, {
      ...DETAIL,
      assessment: { ...DETAIL.assessment, status: 'published' },
    });

    expect(header.isEditable).toBe(false);
    expect(header.readOnlyLabel).toBe('assessments.workflowReadOnly');
  });
});

describe('resolveTemplateMetricIds', () => {
  it('resolves the template metrics once both sides arrived', () => {
    expect(resolveTemplateMetricIds(CATALOG, DETAIL)).toHaveLength(3);
  });

  it('returns nothing while either side is missing', () => {
    expect(resolveTemplateMetricIds(undefined, DETAIL)).toEqual([]);
    expect(resolveTemplateMetricIds(CATALOG, undefined)).toEqual([]);
  });
});

describe('buildEntryGroups', () => {
  it('groups the fields once both sides arrived', () => {
    expect(buildEntryGroups(t, CATALOG, DETAIL, {})).toHaveLength(2);
  });

  it('returns nothing while either side is missing', () => {
    expect(buildEntryGroups(t, undefined, DETAIL, {})).toEqual([]);
    expect(buildEntryGroups(t, CATALOG, undefined, {})).toEqual([]);
  });
});

describe('buildCompleteness', () => {
  it('reports zero percent for an empty template rather than dividing by zero', () => {
    expect(buildCompleteness(t, {}, []).completenessPercent).toBe(0);
  });

  it('counts a scored zero towards completeness', () => {
    const draft = {
      'metric-attitude': {
        metricDefinitionId: 'metric-attitude',
        numericValue: 0,
        textValue: null,
        note: null,
      },
    };

    expect(
      buildCompleteness(t, draft, ['metric-attitude', 'metric-speed']).completenessPercent,
    ).toBe(50);
  });
});

describe('buildWorkflowActions', () => {
  it('returns nothing before the record resolves', () => {
    expect(buildWorkflowActions(t, undefined, Object.values(PERMISSIONS))).toEqual([]);
  });

  it('prepares the permitted step with its tone and test id', () => {
    const actions = buildWorkflowActions(t, DETAIL, [PERMISSIONS.assessmentCreate]);

    expect(actions).toEqual([
      {
        step: 'submit',
        label: 'assessments.submit',
        tone: 'primary',
        testId: 'assessment-submit',
      },
    ]);
  });
});

describe('buildRevisionViews', () => {
  it('translates each revision label and status', () => {
    const views = buildRevisionViews(t, [buildAssessmentSummary({ status: 'published' })]);

    expect(views[0]?.statusLabel).toBe('assessments.statusPublished');
    expect(views[0]?.statusTone).toBe('success');
  });
});

describe('buildGridCopy', () => {
  it('resolves every static label the grid needs', () => {
    const copy = buildGridCopy(t);

    expect(copy.notEvaluatedHint).toBe('assessments.metricNotEvaluatedHint');
    expect(Object.values(copy).every((value) => value.startsWith('assessments.'))).toBe(true);
  });
});
