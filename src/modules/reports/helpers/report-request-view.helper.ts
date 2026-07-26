import type { TranslateParams } from '@/packages/i18n';
import type { Season } from '@/modules/teams';
import { I18N_KEYS } from '@/shared/i18n';

import {
  REPORT_FORMATS,
  REPORTS_FILTER_ALL,
  TEMPLATE_CATALOG,
  type ReportFormat,
  type ReportPrivacyClass,
  type ReportTemplate,
} from '../constants/reports.constants';
import type { ReportRequestPanelView } from '../types/reports-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const FORMAT_LABEL_KEYS: Readonly<Record<ReportFormat, string>> = {
  csv: I18N_KEYS.reports.formatCsv,
  xlsx: I18N_KEYS.reports.formatXlsx,
  pdf: I18N_KEYS.reports.formatPdf,
};

const PRIVACY_VIEWS: Readonly<
  Record<ReportPrivacyClass, { readonly key: string; readonly tone: string }>
> = {
  public: { key: I18N_KEYS.reports.privacyPublic, tone: 'success' },
  team: { key: I18N_KEYS.reports.privacyTeam, tone: 'medium' },
  restricted: { key: I18N_KEYS.reports.privacyRestricted, tone: 'warning' },
};

/** The callbacks + resolved state the request panel view binds. */
export interface RequestPanelInputs {
  readonly template: ReportTemplate;
  readonly format: ReportFormat;
  readonly season: string;
  readonly seasons: readonly Season[];
  readonly isOffline: boolean;
  readonly isSubmitting: boolean;
  readonly validationMessage: string | null;
  readonly onSelectTemplate: (template: ReportTemplate) => void;
  readonly onFormatChange: (value: string) => void;
  readonly onSeasonChange: (value: string) => void;
  readonly onSubmit: () => void;
}

/** The template radio cards with their privacy chips and restricted helper text. */
function buildTemplateCards(
  t: Translate,
  active: ReportTemplate,
  onSelect: (template: ReportTemplate) => void,
) {
  return TEMPLATE_CATALOG.map((entry) => ({
    template: entry.template,
    label: t(entry.labelKey),
    hint: t(entry.hintKey),
    privacyLabel: t(PRIVACY_VIEWS[entry.privacy].key),
    privacyTone: PRIVACY_VIEWS[entry.privacy].tone,
    restrictedHint: entry.privacy === 'restricted' ? t(I18N_KEYS.reports.restrictedHint) : null,
    isSelected: entry.template === active,
    onSelect: () => {
      onSelect(entry.template);
    },
  }));
}

/** Assemble the full request panel view from resolved state and callbacks. */
export function buildRequestPanelView(
  t: Translate,
  inputs: RequestPanelInputs,
): ReportRequestPanelView {
  return {
    heading: t(I18N_KEYS.reports.requestHeading),
    intro: t(I18N_KEYS.reports.requestIntro),
    templateLabel: t(I18N_KEYS.reports.templateLabel),
    templates: buildTemplateCards(t, inputs.template, inputs.onSelectTemplate),
    formatLabel: t(I18N_KEYS.reports.formatLabel),
    formatValue: inputs.format,
    formatOptions: REPORT_FORMATS.map((value) => ({ value, label: t(FORMAT_LABEL_KEYS[value]) })),
    onFormatChange: inputs.onFormatChange,
    seasonLabel: t(I18N_KEYS.reports.seasonLabel),
    seasonValue: inputs.season,
    seasonOptions: [
      { value: REPORTS_FILTER_ALL, label: t(I18N_KEYS.reports.seasonAll) },
      ...inputs.seasons.map((entry) => ({ value: entry.id, label: entry.name })),
    ],
    onSeasonChange: inputs.onSeasonChange,
    submitLabel: t(I18N_KEYS.reports.requestSubmit),
    canSubmit: !inputs.isOffline && !inputs.isSubmitting,
    isSubmitting: inputs.isSubmitting,
    onSubmit: inputs.onSubmit,
    validationMessage: inputs.validationMessage,
    offlineReason: inputs.isOffline ? t(I18N_KEYS.reports.offlineActionsHint) : null,
  };
}

/** Normalize a raw format select value to the closed set. */
export function coerceFormat(value: string): ReportFormat {
  return value === 'xlsx' ? 'xlsx' : value === 'pdf' ? 'pdf' : 'csv';
}
