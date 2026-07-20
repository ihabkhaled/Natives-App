import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  METRIC_DIRECTION_LABEL_KEYS,
  METRIC_SOURCE_LABEL_KEYS,
  METRIC_VALUE_KIND,
} from '../constants/assessments.constants';
import type { MetricValueKind } from '../constants/assessments.constants';
import type { MetricFieldView, MetricGroupView } from '../types/assessments-view.types';
import type {
  AssessmentCatalog,
  AssessmentValueDraft,
  MetricDefinition,
  MetricScale,
} from '../types/assessments.types';
import { isLegacyScoreScale, isTextScale, readDraftValue } from './assessment-value.helper';

type Translate = (key: string, params?: TranslateParams) => string;

interface FieldInput {
  readonly metric: MetricDefinition;
  readonly scale: MetricScale | undefined;
  readonly required: boolean;
  readonly value: AssessmentValueDraft;
}

interface CategoryInput {
  readonly catalog: AssessmentCatalog;
  readonly entries: readonly TemplateEntry[];
  readonly categoryId: string;
  readonly draft: Readonly<Record<string, AssessmentValueDraft>>;
}

interface TemplateEntry {
  readonly metricDefinitionId: string;
  readonly required: boolean;
  readonly sortOrder: number;
}

/** Present the stored value; "not evaluated" never renders as 0. */
export function buildValueReadout(t: Translate, value: AssessmentValueDraft): string {
  if (value.numericValue !== null) {
    return `${value.numericValue}`;
  }
  return value.textValue ?? t(I18N_KEYS.assessments.notEvaluatedReadout);
}

function inputLabelKey(valueKind: MetricValueKind): string {
  if (isTextScale(valueKind)) {
    return I18N_KEYS.assessments.metricTextLabel;
  }
  return isLegacyScoreScale(valueKind)
    ? I18N_KEYS.assessments.metricScoreLabel
    : I18N_KEYS.assessments.metricValueLabel;
}

function unitLabel(t: Translate, scale: MetricScale | undefined): string | null {
  const unit = scale?.unit ?? null;
  return unit === null ? null : t(I18N_KEYS.assessments.metricUnitLabel, { unit });
}

interface ScaleShape {
  readonly valueKind: MetricValueKind;
  readonly isScoreScale: boolean;
  readonly isTextScale: boolean;
  readonly options: readonly string[];
  readonly minimumValue: number | null;
  readonly maximumValue: number | null;
  readonly stepValue: number | null;
}

/** The 0–5 evaluator scale every metric falls back to. */
const DEFAULT_SCALE_SHAPE: ScaleShape = {
  valueKind: METRIC_VALUE_KIND.Legacy05,
  isScoreScale: true,
  isTextScale: false,
  options: [],
  minimumValue: null,
  maximumValue: null,
  stepValue: null,
};

/** Scale-derived shape of one input; a missing scale falls back to 0–5. */
function buildScaleShape(scale: MetricScale | undefined): ScaleShape {
  if (scale === undefined) {
    return DEFAULT_SCALE_SHAPE;
  }
  return {
    valueKind: scale.valueKind,
    isScoreScale: isLegacyScoreScale(scale.valueKind),
    isTextScale: isTextScale(scale.valueKind),
    options: scale.categoricalOptions,
    minimumValue: scale.minimumValue,
    maximumValue: scale.maximumValue,
    stepValue: scale.stepValue,
  };
}

function buildField(t: Translate, input: FieldInput): MetricFieldView {
  const { metric, value } = input;
  const shape = buildScaleShape(input.scale);
  return {
    ...shape,
    metricDefinitionId: metric.id,
    name: metric.name,
    definition: metric.definition,
    guidance: metric.guidance,
    requiredLabel: t(
      input.required ? I18N_KEYS.assessments.metricRequired : I18N_KEYS.assessments.metricOptional,
    ),
    isRequired: input.required,
    directionLabel: t(METRIC_DIRECTION_LABEL_KEYS[metric.direction]),
    sourceLabel: t(METRIC_SOURCE_LABEL_KEYS[metric.source]),
    source: metric.source,
    unitLabel: unitLabel(t, input.scale),
    numericValue: value.numericValue,
    textValue: value.textValue,
    note: value.note,
    isEvaluated: value.numericValue !== null || value.textValue !== null,
    valueReadout: buildValueReadout(t, value),
    inputLabel: t(inputLabelKey(shape.valueKind), { metric: metric.name }),
  };
}

function orderedTemplateEntries(
  catalog: AssessmentCatalog,
  templateId: string,
): readonly TemplateEntry[] {
  const template = catalog.templates.find((candidate) => candidate.id === templateId);
  return template === undefined
    ? []
    : [...template.metrics].sort((left, right) => left.sortOrder - right.sortOrder);
}

function fieldsForCategory(t: Translate, input: CategoryInput): readonly MetricFieldView[] {
  return input.entries.flatMap((entry) => {
    const metric = input.catalog.metrics.find(
      (candidate) => candidate.id === entry.metricDefinitionId,
    );
    if (metric?.categoryId !== input.categoryId) {
      return [];
    }
    return [
      buildField(t, {
        metric,
        scale: input.catalog.scales.find((scale) => scale.id === metric.scaleId),
        required: entry.required,
        value: readDraftValue(input.draft, metric.id),
      }),
    ];
  });
}

/**
 * Group the template metrics by category, in catalog sort order, resolving
 * every label so the grid component stays UI-only.
 */
export function buildMetricGroups(
  t: Translate,
  catalog: AssessmentCatalog,
  templateId: string,
  draft: Readonly<Record<string, AssessmentValueDraft>>,
): readonly MetricGroupView[] {
  const entries = orderedTemplateEntries(catalog, templateId);
  const categories = [...catalog.categories].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  return categories.flatMap((category) => {
    const fields = fieldsForCategory(t, { catalog, entries, categoryId: category.id, draft });
    return fields.length === 0
      ? []
      : [
          {
            categoryId: category.id,
            name: category.name,
            description: category.description,
            fields,
          },
        ];
  });
}

/** Every metric id the template asks for, in sort order. */
export function templateMetricIds(
  catalog: AssessmentCatalog,
  templateId: string,
): readonly string[] {
  return orderedTemplateEntries(catalog, templateId).map((entry) => entry.metricDefinitionId);
}
