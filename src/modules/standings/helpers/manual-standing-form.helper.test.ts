import { describe, expect, it } from 'vitest';

import {
  buildManualStandingDraft,
  toManualStandingCommand,
  validateManualStandingDraft,
} from './manual-standing-form.helper';

describe('buildManualStandingDraft', () => {
  it('starts as our team with zero counts and an unscored spirit', () => {
    const draft = buildManualStandingDraft();
    expect(draft.entrantKind).toBe('team');
    expect(draft.played).toBe('0');
    expect(draft.spiritScore).toBe('');
    expect(draft.reconciliationNote).toBe('');
  });
});

describe('validateManualStandingDraft', () => {
  const valid = {
    ...buildManualStandingDraft(),
    played: '3',
    wins: '2',
    losses: '1',
    ties: '0',
    reconciliationNote: 'Recorded from the paper sheet.',
    ruleKey: 'league',
  };

  it('accepts a consistent, noted, ruled draft', () => {
    expect(validateManualStandingDraft(valid)).toBeNull();
  });

  it('rejects when wins + losses + ties do not equal played', () => {
    expect(validateManualStandingDraft({ ...valid, wins: '3' })).toBe('counts');
  });

  it('rejects a non-integer or negative count', () => {
    expect(
      validateManualStandingDraft({ ...valid, played: '-1', wins: '0', losses: '0', ties: '0' }),
    ).toBe('counts');
    expect(validateManualStandingDraft({ ...valid, played: 'x' })).toBe('counts');
  });

  it('rejects a too-short reconciliation note', () => {
    expect(validateManualStandingDraft({ ...valid, reconciliationNote: 'a' })).toBe('note');
  });

  it('rejects a missing rule key', () => {
    expect(validateManualStandingDraft({ ...valid, ruleKey: '' })).toBe('rule');
  });
});

describe('toManualStandingCommand', () => {
  it('maps a draft to the wire command, keeping a blank spirit null', () => {
    const command = toManualStandingCommand(
      {
        ...buildManualStandingDraft(),
        entrantKind: 'opponent',
        played: '4',
        wins: '2',
        losses: '1',
        ties: '1',
        pointsFor: '40',
        pointsAgainst: '35',
        spiritScore: '',
        sourceReference: '  cup  ',
        reconciliationNote: '  note here  ',
        ruleKey: 'league',
      },
      'comp-1',
    );
    expect(command).toMatchObject({
      competitionId: 'comp-1',
      entrantKind: 'opponent',
      opponentId: null,
      spiritScore: null,
      finalPlace: null,
      qualification: null,
      sourceReference: 'cup',
      reconciliationNote: 'note here',
      ruleKey: 'league',
    });
  });

  it('carries a scored spirit through and defaults entrant to team', () => {
    const command = toManualStandingCommand(
      { ...buildManualStandingDraft(), spiritScore: '12', sourceReference: '' },
      'comp-1',
    );
    expect(command.spiritScore).toBe(12);
    expect(command.entrantKind).toBe('team');
    expect(command.sourceReference).toBeNull();
  });
});
