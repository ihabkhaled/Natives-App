import { describe, expect, it } from 'vitest';

import {
  buildAssessmentCatalog,
  buildAssessmentSummary,
} from '../../../../tests/factories/assessments.factory';
import {
  ALL_STATUSES_FILTER,
  buildStatusOptions,
  buildSummaryView,
  filterByStatus,
  resolveAssessmentsStatus,
  statusLabel,
  statusTone,
} from './assessment-list-view.helper';

const t = (key: string): string => key;
const CATALOG = buildAssessmentCatalog();

describe('buildStatusOptions', () => {
  it('leads with an explicit all option', () => {
    const options = buildStatusOptions(t);

    expect(options[0]?.value).toBe(ALL_STATUSES_FILTER);
    expect(options).toHaveLength(7);
  });
});

describe('filterByStatus', () => {
  const items = [
    buildAssessmentSummary(),
    buildAssessmentSummary({ id: 'asmt-2', status: 'published' }),
  ];

  it('keeps everything under the all filter', () => {
    expect(filterByStatus(items, ALL_STATUSES_FILTER)).toHaveLength(2);
  });

  it('narrows to one status', () => {
    expect(filterByStatus(items, 'published').map((item) => item.id)).toEqual(['asmt-2']);
  });
});

describe('buildSummaryView', () => {
  it('names the period from the catalog and reports the created instant', () => {
    const view = buildSummaryView(t, 'en', CATALOG, buildAssessmentSummary());

    expect(view.periodLabel).toBe('Summer 2026');
    expect(view.statusLabel).toBe('assessments.statusDraft');
    expect(view.timestampLabel).toContain('assessments.updatedAtLabel');
  });

  it('reports the published instant once published', () => {
    const view = buildSummaryView(
      t,
      'en',
      CATALOG,
      buildAssessmentSummary({ status: 'published', publishedAtIso: '2026-07-10T12:00:00.000Z' }),
    );

    expect(view.timestampLabel).toContain('assessments.publishedAtLabel');
  });

  it('falls back to the raw period id without a catalog', () => {
    expect(buildSummaryView(t, 'en', undefined, buildAssessmentSummary()).periodLabel).toBe(
      'period-summer-2026',
    );
  });
});

describe('resolveAssessmentsStatus', () => {
  const base = {
    isForbidden: false,
    hasData: false,
    hasItems: false,
    isLoading: false,
    hasError: false,
    isOffline: false,
  };

  it('puts forbidden ahead of everything', () => {
    expect(resolveAssessmentsStatus({ ...base, isForbidden: true, isLoading: true })).toBe(
      'forbidden',
    );
  });

  it('reports a missing record as its own designed empty state', () => {
    expect(resolveAssessmentsStatus({ ...base, isMissing: true, hasError: true })).toBe('empty');
  });

  it('reports ready when data with items arrived', () => {
    expect(resolveAssessmentsStatus({ ...base, hasData: true, hasItems: true })).toBe('ready');
  });

  it('reports empty when data arrived with nothing in it', () => {
    expect(resolveAssessmentsStatus({ ...base, hasData: true })).toBe('empty');
  });

  it('prefers loading over offline while the first request is in flight', () => {
    expect(resolveAssessmentsStatus({ ...base, isLoading: true, isOffline: true })).toBe('loading');
  });

  it('reports offline once loading settles with no data', () => {
    expect(resolveAssessmentsStatus({ ...base, isOffline: true })).toBe('offline');
  });

  it('reports an error when the request failed online', () => {
    expect(resolveAssessmentsStatus({ ...base, hasError: true })).toBe('error');
  });

  it('falls back to empty when nothing else applies', () => {
    expect(resolveAssessmentsStatus(base)).toBe('empty');
  });
});

describe('status presentation', () => {
  it('maps a status to its tone and label', () => {
    expect(statusTone('published')).toBe('success');
    expect(statusLabel(t, 'in_review')).toBe('assessments.statusInReview');
  });
});
