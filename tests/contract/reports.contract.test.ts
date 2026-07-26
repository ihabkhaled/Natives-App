import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { assert, describe, expect, it } from 'vitest';

import {
  listReportJobsResponseSchema,
  REPORT_TEMPLATES,
  reportDownloadResponseSchema,
  reportJobResponseSchema,
  TEMPLATE_CATALOG,
} from '@/modules/reports';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_REPORTS } from '@/tests/msw/reports.fixture';

import { apiUrl, authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

const CONTRACT_PATH = fileURLToPath(new URL('../../contracts/openapi.json', import.meta.url));

interface OpenApiContract {
  readonly paths: Record<
    string,
    { readonly get?: { readonly parameters?: readonly { readonly name: string }[] } }
  >;
  readonly components: {
    readonly schemas: Record<
      string,
      { readonly properties?: Record<string, { readonly enum?: readonly string[] }> }
    >;
  };
}

function contract(): OpenApiContract {
  return JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as OpenApiContract;
}

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_REPORTS.teamId, suffix);
}

describe('reports wire contract (mock mode = remote contract)', () => {
  it('serves a bounded job page', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authGet(teamPath('/reports?limit=20&offset=0'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(listReportJobsResponseSchema, await response.json());
    assert(parsed.success, 'list violated ListReportJobsResponseDto');
    expect(parsed.data.items.some((job) => job.status === 'completed')).toBe(true);
  });

  it('requests a job that appears queued', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authPost(teamPath('/reports'), token, {
      template: 'team_overview',
      format: 'csv',
    });
    expect(response.status).toBe(201);
    const parsed = safeParseWithSchema(reportJobResponseSchema, await response.json());
    assert(parsed.success, 'job violated ReportJobResponseDto');
    expect(parsed.data.status).toBe('queued');
  });

  it('mints a signed download URL with a checksum for a completed job', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authGet(
      teamPath(`/reports/${MOCK_REPORTS.completedJobId}/download`),
      token,
    );
    const parsed = safeParseWithSchema(reportDownloadResponseSchema, await response.json());
    assert(parsed.success, 'ticket violated ReportDownloadResponseDto');
    expect(parsed.data.url.length).toBeGreaterThan(0);
    expect(parsed.data.checksum.length).toBeGreaterThan(0);
  });

  it('refuses a download of an expired job with the expired key', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const response = await authGet(
      teamPath(`/reports/${MOCK_REPORTS.expiredJobId}/download`),
      token,
    );
    expect(response.status).toBe(410);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.reports.expired');
  });

  it('exposes the seasonId and requestedBy list facets (B1)', () => {
    const params = (contract().paths['/teams/{teamId}/reports']?.get?.parameters ?? []).map(
      (parameter) => parameter.name,
    );
    expect(params).toContain('seasonId');
    expect(params).toContain('requestedBy');
  });

  it('pins the frontend template catalog to the OpenAPI enum', () => {
    const templateEnum =
      contract().components.schemas['ReportJobResponseDto']?.properties?.['template']?.enum ?? [];
    expect([...templateEnum].toSorted()).toEqual([...REPORT_TEMPLATES].toSorted());
    expect(TEMPLATE_CATALOG.map((entry) => entry.template).toSorted()).toEqual(
      [...REPORT_TEMPLATES].toSorted(),
    );
  });

  it('gates listing on report.read: a member persona is forbidden', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(teamPath('/reports'), token);
    expect(response.status).toBe(403);
  });

  it('rejects an anonymous job list', async () => {
    const response = await fetch(apiUrl(teamPath('/reports')));
    expect(response.status).toBe(401);
  });
});
