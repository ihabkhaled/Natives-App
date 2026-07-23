import type { superAdminEntryResponseSchema, superAdminListResponseSchema } from '@/modules/admin';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_PERSONA_EMAILS } from './mock-data.constants';
import { PERSONA_USERS } from './personas.fixture';

type SuperAdminEntryDto = SchemaOutput<typeof superAdminEntryResponseSchema>;
type SuperAdminListDto = SchemaOutput<typeof superAdminListResponseSchema>;

/**
 * The platform super-admin roster. Seeded with exactly one administrator so
 * the LAST-ADMIN refusal is the default revoke outcome — the safeguard is the
 * scenario, not an edge case a test has to construct.
 */
function seedRoster(): SuperAdminEntryDto[] {
  const admin = PERSONA_USERS[MOCK_PERSONA_EMAILS.admin];
  return [
    {
      assignmentId: 'assignment-super-0001',
      userId: admin?.id ?? 'user-1',
      email: admin?.email ?? MOCK_PERSONA_EMAILS.admin,
      displayName: admin?.displayName ?? null,
      effectiveFrom: '2026-01-05T09:00:00.000Z',
      grantedBy: null,
    },
  ];
}

let roster = seedRoster();

export function resetMockPlatformAdminsState(): void {
  roster = seedRoster();
}

export function superAdminsResponse(): SuperAdminListDto {
  return { items: roster.map((entry) => ({ ...entry })), total: roster.length };
}

/** Idempotent promote: an already-live assignment is returned, not duplicated. */
export function promoteSuperAdminRecord(
  userId: string,
  grantedBy: string,
): SuperAdminEntryDto | 'unknown-user' {
  const existing = roster.find((entry) => entry.userId === userId);
  if (existing !== undefined) {
    return { ...existing };
  }
  const persona = Object.values(PERSONA_USERS).find((user) => user.id === userId);
  if (persona === undefined) {
    return 'unknown-user';
  }
  const created: SuperAdminEntryDto = {
    assignmentId: `assignment-super-${userId}`,
    userId,
    email: persona.email,
    displayName: persona.displayName,
    effectiveFrom: '2026-07-20T10:00:00.000Z',
    grantedBy,
  };
  roster = [...roster, created];
  return { ...created };
}

export function revokeSuperAdminRecord(userId: string): 'ok' | 'not-found' | 'last-admin' {
  const exists = roster.some((entry) => entry.userId === userId);
  if (!exists) {
    return 'not-found';
  }
  if (roster.length <= 1) {
    return 'last-admin';
  }
  roster = roster.filter((entry) => entry.userId !== userId);
  return 'ok';
}
