import { describe, expect, it } from 'vitest';

import type { Roster, RosterEntry, RosterSnapshot } from '../types/rosters.types';
import {
  availableRosterActions,
  buildEntryColumns,
  buildEntryRows,
  buildHistoryRows,
  buildRosterCard,
  buildRosterFacts,
  buildRosterHeadline,
  buildRosterSections,
} from './roster-detail.helper';
import { buildValidationPanel } from './roster-validation.helper';

const t = (key: string): string => key;
const instant = (iso: string): string => `cairo:${iso}`;

function roster(overrides: Partial<Roster> = {}): Roster {
  return {
    rosterId: 'r-1',
    competitionId: 'comp-1',
    fixtureId: null,
    squadId: 'squad-1',
    rosterKind: 'competition',
    name: 'League roster',
    status: 'draft',
    division: 'mixed',
    minSize: 12,
    maxSize: 20,
    minWomen: 5,
    requireCaptain: true,
    policyVersion: 'roster-policy-v2',
    selectionDeadline: '2026-09-02T18:00:00.000Z',
    notes: 'Travelling squad only.',
    revision: 1,
    recordVersion: 2,
    revisionReason: null,
    lockedAt: null,
    ...overrides,
  };
}

function entry(overrides: Partial<RosterEntry> = {}): RosterEntry {
  return {
    entryId: 'e-1',
    membershipId: 'm-1',
    jerseyNumber: 7,
    entryRole: 'player',
    lineAssignment: 'any',
    fieldPosition: 'handler',
    genderBucket: 'men',
    status: 'selected',
    availability: 'available',
    constraintOverridden: false,
    overrideReason: null,
    recordVersion: 1,
    ...overrides,
  };
}

const SNAPSHOT: RosterSnapshot = {
  snapshotId: 's-1',
  revision: 2,
  reason: 'locked',
  rosterStatus: 'locked',
  entryCount: 14,
  takenAt: '2026-07-12T09:00:00.000Z',
};

describe('buildRosterCard', () => {
  it('summarises kind, division, size, and revision', () => {
    const card = buildRosterCard(t, roster());

    expect(card).toMatchObject({
      id: 'r-1',
      kindLabel: 'rosters.kindCompetition',
      divisionLabel: 'rosters.divisionMixed',
      statusTone: 'medium',
    });
    expect(card.revisionLabel).toContain('1');
  });
});

describe('buildRosterHeadline', () => {
  it('degrades to a titled, tone-neutral header while the record is absent', () => {
    expect(buildRosterHeadline(t, null)).toEqual({
      heading: 'rosters.detailTitle',
      statusLabel: '',
      statusTone: 'medium',
      notes: null,
      isLocked: false,
    });
  });

  it('marks a locked or archived roster as frozen', () => {
    expect(buildRosterHeadline(t, roster({ status: 'locked' })).isLocked).toBe(true);
    expect(buildRosterHeadline(t, roster({ status: 'archived' })).isLocked).toBe(true);
    expect(buildRosterHeadline(t, roster()).isLocked).toBe(false);
  });
});

describe('buildRosterFacts', () => {
  it('returns nothing while the roster is still loading', () => {
    expect(buildRosterFacts(t, instant, null)).toEqual([]);
  });

  it('says there is no minimum rather than printing a zero', () => {
    const facts = buildRosterFacts(
      t,
      instant,
      roster({ minWomen: null, requireCaptain: false, selectionDeadline: null }),
    );

    expect(facts[3]?.value).toBe('rosters.minWomenNone');
    expect(facts[4]?.value).toBe('rosters.captainOptional');
    expect(facts[6]?.value).toBe('rosters.deadlineNone');
  });

  it('renders the policy values when they exist', () => {
    const facts = buildRosterFacts(t, instant, roster());

    expect(facts[3]?.value).toBe('5');
    expect(facts[4]?.value).toBe('rosters.captainRequired');
    expect(facts[6]?.value).toBe('cairo:2026-09-02T18:00:00.000Z');
  });
});

describe('buildValidationPanel', () => {
  it('reports a blocked verdict and empty composition before the read lands', () => {
    const panel = buildValidationPanel(t, null);

    expect(panel.verdictLabel).toBe('rosters.validationBlocked');
    expect(panel.violations).toEqual([]);
    expect(panel.composition[0]?.value).toBe('0');
  });

  it('translates every reported violation with its severity tone', () => {
    const panel = buildValidationPanel(t, {
      rosterId: 'r-1',
      policyVersion: 'v2',
      status: 'draft',
      publishable: false,
      composition: {
        selected: 3,
        women: 1,
        men: 1,
        mixed: 0,
        unknownGender: 1,
        offense: 0,
        defense: 1,
        flexible: 2,
        captains: 1,
        spiritCaptains: 0,
        missingJersey: 1,
        duplicateJerseys: 0,
        unavailableSelected: 0,
      },
      violations: [
        { code: 'min_size', severity: 'error', count: 3 },
        { code: 'missing_jersey', severity: 'warning', count: 1 },
      ],
    });

    expect(panel.violations.map((violation) => violation.tone)).toEqual(['danger', 'warning']);
    expect(panel.verdictTone).toBe('warning');
  });

  it('reports a publishable roster as ready', () => {
    const panel = buildValidationPanel(t, {
      rosterId: 'r-1',
      policyVersion: 'v2',
      status: 'draft',
      publishable: true,
      composition: {
        selected: 14,
        women: 5,
        men: 9,
        mixed: 0,
        unknownGender: 0,
        offense: 7,
        defense: 7,
        flexible: 0,
        captains: 1,
        spiritCaptains: 1,
        missingJersey: 0,
        duplicateJerseys: 0,
        unavailableSelected: 0,
      },
      violations: [],
    });

    expect(panel.verdictLabel).toBe('rosters.validationPublishable');
    expect(panel.verdictTone).toBe('success');
  });
});

describe('buildEntryRows', () => {
  it('drops withdrawn entries and spells out every missing value', () => {
    const rows = buildEntryRows(
      t,
      [
        entry(),
        entry({
          entryId: 'e-2',
          membershipId: 'm-2',
          jerseyNumber: null,
          availability: null,
          fieldPosition: 'unspecified',
          genderBucket: 'unknown',
        }),
        entry({ entryId: 'e-3', membershipId: 'm-3', status: 'withdrawn' }),
      ],
      true,
    );

    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({
      jerseyLabel: 'rosters.jerseyNone',
      availabilityLabel: 'rosters.availabilityUnknown',
      positionLabel: 'rosters.positionUnspecified',
      divisionLabel: 'rosters.genderUnknown',
    });
  });

  it('keeps the override provenance on an entry added past a constraint', () => {
    const rows = buildEntryRows(
      t,
      [entry({ constraintOverridden: true, overrideReason: 'Handler depth.' })],
      true,
    );

    expect(rows[0]?.overrideNote).toBe('rosters.overrideNote');
  });

  it('states an override with no recorded reason rather than hiding it', () => {
    const rows = buildEntryRows(t, [entry({ constraintOverridden: true })], false);

    expect(rows[0]?.overrideNote).toBe('rosters.overrideNote');
    expect(rows[0]?.isRemovable).toBe(false);
  });

  it('expands every column heading', () => {
    expect(buildEntryColumns(t)).toHaveLength(8);
  });
});

describe('buildHistoryRows', () => {
  it('labels each snapshot with its reason, revision, and size', () => {
    const rows = buildHistoryRows(t, instant, [SNAPSHOT]);

    expect(rows[0]?.label).toContain('rosters.historyLocked');
    expect(rows[0]?.timeLabel).toBe('cairo:2026-07-12T09:00:00.000Z');
    expect(rows[0]?.entryCountLabel).toBe('rosters.historyEntryCount');
  });
});

describe('availableRosterActions', () => {
  const FULL = { canManage: true, canLock: true };

  it('offers publish only when the server says the roster is publishable', () => {
    expect(availableRosterActions('draft', FULL, true)).toEqual(['publish', 'archive']);
    expect(availableRosterActions('draft', FULL, false)).toEqual(['archive']);
  });

  it('offers lock once published, and only with the lock grant', () => {
    expect(availableRosterActions('published', FULL, true)).toEqual(['lock', 'archive']);
    expect(availableRosterActions('published', { canManage: true, canLock: false }, true)).toEqual([
      'archive',
    ]);
  });

  it('offers publish again after a revision', () => {
    expect(availableRosterActions('revised', FULL, true)).toEqual(['publish', 'archive']);
  });

  it('offers only archive once locked, and nothing once archived', () => {
    expect(availableRosterActions('locked', FULL, true)).toEqual(['archive']);
    expect(availableRosterActions('archived', FULL, true)).toEqual([]);
  });

  it('offers nothing at all without the manage grant', () => {
    expect(availableRosterActions('draft', { canManage: false, canLock: false }, true)).toEqual([]);
  });
});

describe('buildRosterSections', () => {
  it('assembles every section from the four reads', () => {
    const sections = buildRosterSections(t, {
      formatInstant: instant,
      roster: roster(),
      entries: [entry()],
      validation: null,
      snapshots: [SNAPSHOT],
      canRemoveEntries: true,
    });

    expect(sections.entries).toHaveLength(1);
    expect(sections.history).toHaveLength(1);
    expect(sections.facts.length).toBeGreaterThan(0);
    expect(sections.entriesColumns).toHaveLength(8);
  });
});
