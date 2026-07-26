import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  REPORT_FORMATS,
  REPORT_PRIVACY_CLASSES,
  REPORT_STATUSES,
  REPORT_TEMPLATES,
} from '../constants/reports.constants';

/**
 * Wire contracts for asynchronous report generation, shared by remote NestJS
 * mode and MSW mock mode. `failureReason` arrives sanitized and is shown
 * verbatim, never interpreted; the download response is a short-lived signed
 * URL the client must never cache.
 */
export const reportJobResponseSchema = schemaBuilder.object({
  jobId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  template: schemaBuilder.enum(REPORT_TEMPLATES),
  format: schemaBuilder.enum(REPORT_FORMATS),
  privacyClass: schemaBuilder.enum(REPORT_PRIVACY_CLASSES),
  status: schemaBuilder.enum(REPORT_STATUSES),
  progress: schemaBuilder.number().min(0).max(100),
  retryCount: schemaBuilder.number().int().nonnegative(),
  calculationVersion: schemaBuilder.string().min(1),
  snapshotAt: isoInstantField,
  checksum: schemaBuilder.string().nullable(),
  rowCount: schemaBuilder.number().int().nullable(),
  failureReason: schemaBuilder.string().nullable(),
  expiresAt: isoInstantField,
  recordVersion: schemaBuilder.number().int().positive(),
  completedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listReportJobsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(reportJobResponseSchema),
  ...pagedEnvelopeFields,
});

export const reportDownloadResponseSchema = schemaBuilder.object({
  url: schemaBuilder.string().min(1),
  expiresAt: isoInstantField,
  checksum: schemaBuilder.string().min(1),
});
