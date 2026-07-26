import {
  TEMPLATE_CATALOG,
  type ReportFormat,
  type ReportTemplate,
} from '../constants/reports.constants';

/**
 * The default format of a template, exactly as the backend generator resolves
 * it: the catalog's PDF defaults for the three document templates, CSV for
 * everything else. Switching template re-applies the default rather than
 * silently keeping a stale choice.
 */
export function resolveDefaultFormat(template: ReportTemplate): ReportFormat {
  const entry = TEMPLATE_CATALOG.find((candidate) => candidate.template === template);
  return entry?.defaultFormat ?? 'csv';
}

/** The catalog entry of a template (label/hint/privacy for the radio card). */
export function findCatalogEntry(template: ReportTemplate) {
  return TEMPLATE_CATALOG.find((candidate) => candidate.template === template) ?? null;
}
