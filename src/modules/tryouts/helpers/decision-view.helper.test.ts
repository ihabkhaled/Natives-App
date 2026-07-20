import { describe, expect, it, vi } from 'vitest';

import {
  buildCandidateDetail,
  buildCandidateSummary,
} from '../../../../tests/factories/tryouts.factory';
import {
  buildConversionFacts,
  buildEvaluationRows,
  buildScoreDraft,
  buildScoreOptions,
  decisionLabel,
  decisionTone,
  draftToScores,
  isConvertible,
  isDecisionReasonValid,
  NOT_SCORED_VALUE,
  parseScore,
  scoreToValue,
} from './decision-view.helper';

const t = (key: string): string => key;

/** The decision helpers reason about an accepted candidate with one score. */
function detail(overrides: Parameters<typeof buildCandidateDetail>[0] = {}) {
  return buildCandidateDetail({
    summary: buildCandidateSummary({ status: 'accepted', evaluationCount: 1 }),
    scores: [{ criterion: 'throwing', score: 4 }],
    ...overrides,
  });
}

describe('score options and parsing', () => {
  it('offers "not scored" first, then the whole 1..5 band', () => {
    const options = buildScoreOptions(t);

    expect(options[0]).toEqual({ value: NOT_SCORED_VALUE, label: 'tryouts.evaluationNotScored' });
    expect(options.slice(1).map((option) => option.value)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('maps an unscored criterion to null, never to zero', () => {
    expect(parseScore(NOT_SCORED_VALUE)).toBeNull();
    expect(parseScore('3')).toBe(3);
    expect(scoreToValue(null)).toBe(NOT_SCORED_VALUE);
    expect(scoreToValue(0)).toBe('0');
  });

  it('defaults every criterion the evaluator has not touched to unscored', () => {
    const draft = buildScoreDraft(detail().scores);

    expect(draft.throwing).toBe('4');
    expect(draft.catching).toBe(NOT_SCORED_VALUE);
    expect(draft.movement).toBe(NOT_SCORED_VALUE);
    expect(draft.attitude).toBe(NOT_SCORED_VALUE);
  });

  it('round-trips a draft back into a null-preserving score list', () => {
    const scores = draftToScores(buildScoreDraft(detail().scores));

    expect(scores).toEqual([
      { criterion: 'throwing', score: 4 },
      { criterion: 'catching', score: null },
      { criterion: 'movement', score: null },
      { criterion: 'attitude', score: null },
    ]);
  });

  it('builds one labelled row per criterion and reports edits by criterion', () => {
    const onChange = vi.fn();
    const rows = buildEvaluationRows(t, buildScoreDraft([]), buildScoreOptions(t), onChange);
    rows[1]?.onChange('5');

    expect(rows).toHaveLength(4);
    expect(rows[0]?.label).toBe('tryouts.criterionThrowing');
    expect(onChange).toHaveBeenCalledWith('catching', '5');
  });
});

describe('decision helpers', () => {
  it('requires a reason of at least the server minimum', () => {
    expect(isDecisionReasonValid('four')).toBe(false);
    expect(isDecisionReasonValid('   ')).toBe(false);
    expect(isDecisionReasonValid('Great across every drill')).toBe(true);
  });

  it('reports no decision label until a decision exists', () => {
    expect(decisionLabel(t, null)).toBeNull();
    expect(decisionLabel(t, detail())).toBeNull();
  });

  it('labels a recorded decision', () => {
    const decided = detail({
      decision: {
        outcome: 'decline',
        reason: 'Not this round.',
        decidedAt: '2026-08-16T10:00:00.000Z',
        offerExpiresAt: null,
      },
    });

    expect(decisionLabel(t, decided)).toBe('tryouts.decisionDecline');
    expect(decisionTone('decline')).toBe('danger');
  });
});

describe('conversion helpers', () => {
  it('renders no preview before a candidate is chosen', () => {
    expect(buildConversionFacts(t, null)).toEqual([]);
    expect(isConvertible(null)).toBe(false);
  });

  it('previews the name, reference, and accepted consent version', () => {
    expect(buildConversionFacts(t, detail()).map((fact) => fact.key)).toEqual([
      'name',
      'reference',
      'consent',
    ]);
  });

  it('allows conversion only for an accepted, not-yet-converted candidate', () => {
    expect(isConvertible(detail())).toBe(true);
    expect(isConvertible(detail({ convertedMembershipId: 'membership-1' }))).toBe(false);
    expect(isConvertible(detail({ summary: { ...detail().summary, status: 'registered' } }))).toBe(
      false,
    );
  });
});
