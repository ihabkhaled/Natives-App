import { assert, describe, expect, it } from 'vitest';

import {
  parseTypedSettingValue,
  SETTING_KEYS,
  settingsSnapshotResponseSchema,
  settingValueSchemas,
  settingVersionListResponseSchema,
  settingVersionResponseSchema,
} from '@/modules/admin';
import type { SettingValueByKey } from '@/modules/admin/types/setting-values.types';
import type {
  AssessmentScaleValueContract,
  AttendanceStatusesValueContract,
  AttendanceWeightsValueContract,
  BadgeTiersValueContract,
  NotificationRulesValueContract,
  ReportBrandingValueContract,
  RosterLimitsValueContract,
  SessionTypesValueContract,
} from '@/packages/api-contract';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ADMIN } from '@/tests/msw/admin.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import {
  AUDIT_NONSENSE_PAYLOAD,
  VALID_BADGE_TIERS,
  VALID_SETTING_DOCUMENTS,
} from '@/tests/msw/setting-values.fixture';

import {
  apiUrl,
  authDelete,
  authGet,
  authPost,
  loginAs,
  teamScopedPath,
} from '../setup/contract-api.helper';

// Compile-time drift guard: every generated value contract must satisfy the
// client's per-key domain type (contract → domain assignability).
type ContractMatchesDomain = [
  AttendanceStatusesValueContract extends SettingValueByKey['attendance_statuses'] ? true : never,
  SessionTypesValueContract extends SettingValueByKey['session_types'] ? true : never,
  AttendanceWeightsValueContract extends SettingValueByKey['attendance_weights'] ? true : never,
  AssessmentScaleValueContract extends SettingValueByKey['assessment_scale'] ? true : never,
  BadgeTiersValueContract extends SettingValueByKey['badge_tiers'] ? true : never,
  RosterLimitsValueContract extends SettingValueByKey['roster_limits'] ? true : never,
  NotificationRulesValueContract extends SettingValueByKey['notification_rules'] ? true : never,
  ReportBrandingValueContract extends SettingValueByKey['report_branding'] ? true : never,
];
const CONTRACT_MATCHES_DOMAIN: ContractMatchesDomain = [
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
];

function settingsPath(suffix: string): string {
  return teamScopedPath(MOCK_ADMIN.teamId, suffix);
}

function futureInstant(hoursAhead: number): string {
  return new Date(Date.now() + hoursAhead * 3_600_000).toISOString();
}

function versionBody(effectiveFrom: string, overrides: Record<string, unknown> = {}) {
  return {
    settingKey: 'badge_tiers',
    effectiveFrom,
    value: VALID_BADGE_TIERS,
    note: 'Contract-suite tier change',
    ...overrides,
  };
}

describe('typed settings wire contract (mock mode = remote contract 1.4.0)', () => {
  it('keeps the canonical fixtures and the per-key schemas in agreement', () => {
    expect(CONTRACT_MATCHES_DOMAIN).toHaveLength(SETTING_KEYS.length);
    expect(Object.keys(settingValueSchemas).sort()).toEqual([...SETTING_KEYS].sort());
    for (const key of SETTING_KEYS) {
      const parsed = parseTypedSettingValue(key, VALID_SETTING_DOCUMENTS[key]);
      assert(parsed.success, `canonical ${key} document violated its schema`);
    }
  });

  it('serves a typed snapshot: values per key, legacy resolved to null, issues surfaced', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet(settingsPath('/settings/snapshot'), token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(settingsSnapshotResponseSchema, await response.json());
    assert(parsed.success, 'snapshot violated SettingsSnapshotResponseDto');
    const byKey = new Map(parsed.data.settings.map((setting) => [setting.settingKey, setting]));
    expect(parseTypedSettingValue('badge_tiers', byKey.get('badge_tiers')?.value).success).toBe(
      true,
    );
    expect(byKey.get('report_branding')?.valueState).toBe('legacy');
    expect(byKey.get('report_branding')?.value).toBeNull();
    expect(byKey.get('attendance_weights')?.issues).toContain('weights_missing_status:injured');
  });

  it('keeps the raw legacy document visible on the versions endpoint', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet(
      settingsPath('/settings/versions?settingKey=report_branding'),
      token,
    );

    const parsed = safeParseWithSchema(settingVersionListResponseSchema, await response.json());
    assert(parsed.success, 'versions violated ListSettingVersionsResponseDto');
    expect(parsed.data.items[0]?.valueState).toBe('legacy');
    expect(parsed.data.items[0]?.value).toEqual({ logo: 'default' });
  });

  it('refuses the audited nonsense payload with the backend message key', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(futureInstant(2), {
        settingKey: 'attendance_statuses',
        value: AUDIT_NONSENSE_PAYLOAD,
      }),
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.teams.settingValueInvalid');
  });

  it('refuses an offset-less effectiveFrom and a too-short reason', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const local = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody('2026-09-01T12:00'),
    );
    expect(local.status).toBe(400);

    const shortNote = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(futureInstant(2), { note: 'ok' }),
    );
    expect(shortNote.status).toBe(400);
  });

  it('schedules a typed version and resolves it only at its effective instant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const effectiveFrom = futureInstant(3);
    const created = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(effectiveFrom),
    );
    expect(created.status).toBe(201);
    const parsed = safeParseWithSchema(settingVersionResponseSchema, await created.json());
    assert(parsed.success, 'created version violated SettingVersionResponseDto');

    const now = await authGet(settingsPath('/settings/snapshot'), token);
    const nowSnapshot = safeParseWithSchema(settingsSnapshotResponseSchema, await now.json());
    assert(nowSnapshot.success, 'snapshot violated its schema');
    const nowRow = nowSnapshot.data.settings.find((row) => row.settingKey === 'badge_tiers');
    expect(nowRow?.effectiveFrom).not.toBe(effectiveFrom);

    const later = await authGet(
      settingsPath(`/settings/snapshot?asOf=${encodeURIComponent(effectiveFrom)}`),
      token,
    );
    const laterSnapshot = safeParseWithSchema(settingsSnapshotResponseSchema, await later.json());
    assert(laterSnapshot.success, 'as-of snapshot violated its schema');
    const laterRow = laterSnapshot.data.settings.find((row) => row.settingKey === 'badge_tiers');
    expect(laterRow?.effectiveFrom).toBe(effectiveFrom);
  });

  it('guards optimistically: a stale head 409s, a duplicate instant 409s', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const stale = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(futureInstant(4), { expectedHeadVersionId: 'sv-someone-elses' }),
    );
    expect(stale.status).toBe(409);
    const staleBody = (await stale.json()) as { messageKey?: string };
    expect(staleBody.messageKey).toBe('errors.teams.settingVersionStale');

    const instant = futureInstant(5);
    const first = await authPost(settingsPath('/settings/versions'), token, versionBody(instant));
    expect(first.status).toBe(201);
    const duplicate = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(instant),
    );
    expect(duplicate.status).toBe(409);
  });

  it('cancels only a future version: 204 then gone, 409 for history, 404 unknown', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const created = await authPost(
      settingsPath('/settings/versions'),
      token,
      versionBody(futureInstant(6)),
    );
    const createdBody = (await created.json()) as { id: string };

    const cancelled = await authDelete(settingsPath(`/settings/versions/${createdBody.id}`), token);
    expect(cancelled.status).toBe(204);
    const listed = await authGet(settingsPath('/settings/versions?settingKey=badge_tiers'), token);
    const list = safeParseWithSchema(settingVersionListResponseSchema, await listed.json());
    assert(list.success, 'versions violated their schema');
    expect(list.data.items.some((item) => item.id === createdBody.id)).toBe(false);

    const inEffect = await authDelete(settingsPath('/settings/versions/sv-0005'), token);
    expect(inEffect.status).toBe(409);
    const inEffectBody = (await inEffect.json()) as { messageKey?: string };
    expect(inEffectBody.messageKey).toBe('errors.teams.settingVersionNotCancellable');

    const missing = await authDelete(settingsPath('/settings/versions/sv-none'), token);
    expect(missing.status).toBe(404);
  });

  it('enforces authentication and the settings-manage grant', async () => {
    const anonymous = await fetch(apiUrl(settingsPath('/settings/snapshot')));
    expect(anonymous.status).toBe(401);

    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);
    const write = await authPost(
      settingsPath('/settings/versions'),
      memberToken,
      versionBody(futureInstant(2)),
    );
    expect(write.status).toBe(403);

    const memberCancel = await authDelete(settingsPath('/settings/versions/sv-0005'), memberToken);
    expect(memberCancel.status).toBe(403);
  });
});
