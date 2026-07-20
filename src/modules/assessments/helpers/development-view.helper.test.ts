import { describe, expect, it } from 'vitest';

import {
  buildDevelopmentGoal,
  buildSharedFeedback,
} from '../../../../tests/factories/assessments.factory';
import {
  buildFeedbackCard,
  buildFeedbackSections,
  buildGoalCard,
  computeGoalProgressPercent,
  resolveGoalTransition,
} from './development-view.helper';

const t = (key: string): string => key;

describe('buildFeedbackSections', () => {
  it('renders only the fields the server shared', () => {
    const sections = buildFeedbackSections(t, buildSharedFeedback());

    expect(sections.map((section) => section.key)).toEqual([
      'positiveFrisbee',
      'frisbeeImprovement',
      'teamRole',
      'summary',
    ]);
  });

  it('drops blank strings as well as nulls', () => {
    const sections = buildFeedbackSections(
      t,
      buildSharedFeedback({ positiveFrisbee: '   ', frisbeeImprovement: null, summary: null }),
    );

    expect(sections.map((section) => section.key)).toEqual(['teamRole']);
  });
});

describe('buildFeedbackCard', () => {
  it('offers acknowledgement while unacknowledged', () => {
    const card = buildFeedbackCard(t, 'en', buildSharedFeedback());

    expect(card.isAcknowledged).toBe(false);
    expect(card.acknowledgedLabel).toBeNull();
    expect(card.clarificationLabel).toBeNull();
    expect(card.publishedLabel).toContain('assessments.publishedAtLabel');
  });

  it('reports an acknowledgement and a clarification request', () => {
    const card = buildFeedbackCard(
      t,
      'en',
      buildSharedFeedback({
        acknowledgedAtIso: '2026-07-13T09:00:00.000Z',
        clarificationRequested: true,
      }),
    );

    expect(card.isAcknowledged).toBe(true);
    expect(card.acknowledgedLabel).toBe('assessments.feedbackAcknowledged');
    expect(card.clarificationLabel).toBe('assessments.feedbackClarificationRequested');
  });

  it('omits the published line when the instant is unknown', () => {
    expect(
      buildFeedbackCard(t, 'en', buildSharedFeedback({ publishedAtIso: null })).publishedLabel,
    ).toBe('');
  });
});

describe('computeGoalProgressPercent', () => {
  it('scales from baseline to target', () => {
    expect(computeGoalProgressPercent(72, 90, 81)).toBe(50);
  });

  it('treats a missing progress reading as unknown, not zero', () => {
    expect(computeGoalProgressPercent(72, 90, null)).toBeNull();
  });

  it('treats a missing target as unknown', () => {
    expect(computeGoalProgressPercent(72, null, 81)).toBeNull();
  });

  it('defaults a missing baseline to zero of the target scale', () => {
    expect(computeGoalProgressPercent(null, 100, 40)).toBe(40);
  });

  it('handles a zero span at or above the target', () => {
    expect(computeGoalProgressPercent(90, 90, 90)).toBe(100);
    expect(computeGoalProgressPercent(90, 90, 80)).toBe(0);
  });

  it('clamps beyond the target and below the baseline', () => {
    expect(computeGoalProgressPercent(0, 10, 30)).toBe(100);
    expect(computeGoalProgressPercent(10, 20, 0)).toBe(0);
  });
});

describe('resolveGoalTransition', () => {
  it('offers exactly one move per open status and none once closed', () => {
    expect(resolveGoalTransition('proposed')).toBe('activate');
    expect(resolveGoalTransition('active')).toBe('achieve');
    expect(resolveGoalTransition('missed')).toBe('reopen');
    expect(resolveGoalTransition('achieved')).toBeNull();
    expect(resolveGoalTransition('cancelled')).toBeNull();
  });
});

describe('buildGoalCard', () => {
  it('prepares an active goal with a measurable target and an achieve action', () => {
    const card = buildGoalCard(t, buildDevelopmentGoal());

    expect(card.statusLabel).toBe('assessments.goalStatusActive');
    expect(card.targetLabel).toBe('90% reset completion');
    expect(card.progressPercent).toBe(50);
    expect(card.transition?.transition).toBe('achieve');
    expect(card.actions).toHaveLength(2);
    expect(card.actions[0]?.stateLabel).toBe('assessments.goalActionDone');
    expect(card.actions[1]?.dueLabel).toContain('assessments.goalDueLabel');
  });

  it('offers activation for a proposed goal and no meter without a reading', () => {
    const card = buildGoalCard(
      t,
      buildDevelopmentGoal({
        goal: {
          ...buildDevelopmentGoal().goal,
          status: 'proposed',
          measurableTarget: null,
          targetValue: null,
          baselineValue: null,
          progressValue: null,
          dueDate: null,
        },
        actions: [],
      }),
    );

    expect(card.transition?.transition).toBe('activate');
    expect(card.progressPercent).toBeNull();
    expect(card.progressLabel).toBe('assessments.goalProgressUnknown');
    expect(card.targetLabel).toBeNull();
    expect(card.baselineLabel).toBeNull();
    expect(card.dueLabel).toBe('assessments.goalNoDue');
  });

  it('offers a reopen for a missed goal and nothing for a closed one', () => {
    const base = buildDevelopmentGoal();
    const missed = buildGoalCard(t, { ...base, goal: { ...base.goal, status: 'missed' } });
    const achieved = buildGoalCard(t, { ...base, goal: { ...base.goal, status: 'achieved' } });

    expect(missed.transition?.transition).toBe('reopen');
    expect(achieved.transition).toBeNull();
  });

  it('falls back to the numeric target when no measurable target is written', () => {
    const base = buildDevelopmentGoal();
    const card = buildGoalCard(t, { ...base, goal: { ...base.goal, measurableTarget: null } });

    expect(card.targetLabel).toContain('assessments.goalTargetLabel');
    expect(card.baselineLabel).toContain('assessments.goalBaselineLabel');
  });
});
