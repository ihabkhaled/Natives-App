import { describe, expect, it } from 'vitest';

import { buildAssessmentCatalog } from '../../../../tests/factories/assessments.factory';
import { toDraftValues } from './assessment-value.helper';
import { buildMetricGroups, buildValueReadout, templateMetricIds } from './metric-grid-view.helper';

const t = (key: string): string => key;
const CATALOG = buildAssessmentCatalog();
const TEMPLATE_ID = 'template-senior-2026';

const DRAFT = toDraftValues([
  {
    metricDefinitionId: 'metric-speed',
    numericValue: 4,
    textValue: null,
    note: 'quick off the mark',
    confidence: null,
    observationCount: null,
  },
  {
    metricDefinitionId: 'metric-attitude',
    numericValue: 0,
    textValue: null,
    note: null,
    confidence: null,
    observationCount: null,
  },
]);

describe('buildValueReadout', () => {
  it('prints an explicit zero as a number', () => {
    expect(
      buildValueReadout(t, {
        metricDefinitionId: 'm',
        numericValue: 0,
        textValue: null,
        note: null,
      }),
    ).toBe('0');
  });

  it('prints free text when present', () => {
    expect(
      buildValueReadout(t, {
        metricDefinitionId: 'm',
        numericValue: null,
        textValue: 'steady',
        note: null,
      }),
    ).toBe('steady');
  });

  it('prints the not-evaluated readout when nothing was recorded', () => {
    expect(
      buildValueReadout(t, {
        metricDefinitionId: 'm',
        numericValue: null,
        textValue: null,
        note: null,
      }),
    ).toBe('assessments.notEvaluatedReadout');
  });
});

describe('buildMetricGroups', () => {
  it('groups by category in catalog sort order', () => {
    const groups = buildMetricGroups(t, CATALOG, TEMPLATE_ID, DRAFT);

    expect(groups.map((group) => group.name)).toEqual(['Athletic', 'Mental']);
  });

  it('resolves every label on a field', () => {
    const field = buildMetricGroups(t, CATALOG, TEMPLATE_ID, DRAFT)[0]?.fields[0];

    expect(field?.name).toBe('Speed');
    expect(field?.requiredLabel).toBe('assessments.metricRequired');
    expect(field?.sourceLabel).toBe('assessments.sourceObjective');
    expect(field?.isScoreScale).toBe(true);
  });

  it('marks a scored zero as evaluated and a missing metric as not evaluated', () => {
    const groups = buildMetricGroups(t, CATALOG, TEMPLATE_ID, DRAFT);
    const mental = groups[1]?.fields ?? [];

    expect(mental[0]?.isEvaluated).toBe(true);
    expect(mental[0]?.valueReadout).toBe('0');
    expect(mental[1]?.isEvaluated).toBe(false);
    expect(mental[1]?.valueReadout).toBe('assessments.notEvaluatedReadout');
  });

  it('classifies a free-text scale as text input', () => {
    const groups = buildMetricGroups(t, CATALOG, TEMPLATE_ID, DRAFT);

    expect(groups[1]?.fields[1]?.isTextScale).toBe(true);
    expect(groups[1]?.fields[1]?.isScoreScale).toBe(false);
  });

  it('returns nothing for an unknown template', () => {
    expect(buildMetricGroups(t, CATALOG, 'template-missing', DRAFT)).toEqual([]);
  });

  it('drops a category whose metrics are not on the template', () => {
    const catalog = buildAssessmentCatalog({
      categories: [
        ...buildAssessmentCatalog().categories,
        { id: 'cat-empty', key: 'empty', name: 'Empty', description: '', sortOrder: 9 },
      ],
    });

    expect(buildMetricGroups(t, catalog, TEMPLATE_ID, DRAFT).map((group) => group.name)).toEqual([
      'Athletic',
      'Mental',
    ]);
  });

  it('labels a unit when the scale carries one', () => {
    const catalog = buildAssessmentCatalog();
    const withUnit = buildAssessmentCatalog({
      scales: catalog.scales.map((scale) =>
        scale.id === 'scale-0-5' ? { ...scale, unit: 's' } : scale,
      ),
    });

    expect(buildMetricGroups(t, withUnit, TEMPLATE_ID, DRAFT)[0]?.fields[0]?.unitLabel).toBe(
      'assessments.metricUnitLabel',
    );
  });

  it('tolerates a metric whose scale is missing from the catalog', () => {
    const catalog = buildAssessmentCatalog({ scales: [] });

    expect(buildMetricGroups(t, catalog, TEMPLATE_ID, DRAFT)[0]?.fields[0]?.isScoreScale).toBe(
      true,
    );
  });
});

describe('templateMetricIds', () => {
  it('lists template metrics in sort order', () => {
    expect(templateMetricIds(CATALOG, TEMPLATE_ID)).toEqual([
      'metric-speed',
      'metric-attitude',
      'metric-notes',
    ]);
  });

  it('returns nothing for an unknown template', () => {
    expect(templateMetricIds(CATALOG, 'template-missing')).toEqual([]);
  });
});
