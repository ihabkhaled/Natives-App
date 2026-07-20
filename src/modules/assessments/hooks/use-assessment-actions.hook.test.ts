import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppToast } from '@/shared/ui';

import { buildDevelopmentGoal } from '../../../../tests/factories/assessments.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useAcknowledgeFeedbackMutation } from '../mutations/use-acknowledge-feedback-mutation.hook';
import { useAssessmentWorkflowMutation } from '../mutations/use-assessment-workflow-mutation.hook';
import { useGoalTransitionMutation } from '../mutations/use-goal-transition-mutation.hook';
import { useSaveAssessmentMutation } from '../mutations/use-save-assessment-mutation.hook';
import { useAssessmentWorkflowActions } from './use-assessment-workflow-actions.hook';
import { useDevelopmentActions } from './use-development-actions.hook';

vi.mock('@/shared/ui', () => ({ useAppToast: vi.fn() }));
vi.mock('../mutations/use-save-assessment-mutation.hook', () => ({
  useSaveAssessmentMutation: vi.fn(),
}));
vi.mock('../mutations/use-assessment-workflow-mutation.hook', () => ({
  useAssessmentWorkflowMutation: vi.fn(),
}));
vi.mock('../mutations/use-acknowledge-feedback-mutation.hook', () => ({
  useAcknowledgeFeedbackMutation: vi.fn(),
}));
vi.mock('../mutations/use-goal-transition-mutation.hook', () => ({
  useGoalTransitionMutation: vi.fn(),
}));

const showToast = vi.fn().mockResolvedValue(undefined);
const save = vi.fn();
const runWorkflow = vi.fn();
const acknowledge = vi.fn();
const runGoal = vi.fn();

type SaveCallbacks = Parameters<typeof useSaveAssessmentMutation>[2];
type WorkflowCallbacks = Parameters<typeof useAssessmentWorkflowMutation>[1];
type AckCallbacks = Parameters<typeof useAcknowledgeFeedbackMutation>[1];
type GoalCallbacks = Parameters<typeof useGoalTransitionMutation>[1];

let saveCallbacks: SaveCallbacks;
let workflowCallbacks: WorkflowCallbacks;
let ackCallbacks: AckCallbacks;
let goalCallbacks: GoalCallbacks;

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useAppToast).mockReturnValue({ showToast });
  vi.mocked(useSaveAssessmentMutation).mockImplementation((_team, _id, callbacks) => {
    saveCallbacks = callbacks;
    return { save, isSaving: false };
  });
  vi.mocked(useAssessmentWorkflowMutation).mockImplementation((_team, callbacks) => {
    workflowCallbacks = callbacks;
    return { run: runWorkflow, isRunning: false };
  });
  vi.mocked(useAcknowledgeFeedbackMutation).mockImplementation((_team, callbacks) => {
    ackCallbacks = callbacks;
    return { acknowledge, isAcknowledging: false };
  });
  vi.mocked(useGoalTransitionMutation).mockImplementation((_team, callbacks) => {
    goalCallbacks = callbacks;
    return { run: runGoal, isRunning: false };
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function detail(status: string) {
  return { assessment: { status }, values: [] } as never;
}

describe('useAssessmentWorkflowActions', () => {
  it('runs one workflow step against the current record version', () => {
    const { result } = renderHook(() => useAssessmentWorkflowActions('t', 'a'));

    result.current.run('submit', 3);

    expect(runWorkflow).toHaveBeenCalledExactlyOnceWith({
      assessmentId: 'a',
      expectedRecordVersion: 3,
      step: 'submit',
    });
  });

  it('forwards a save and reports the in-flight flag', () => {
    const { result } = renderHook(() => useAssessmentWorkflowActions('t', 'a'));

    result.current.save({ summary: null, values: [], expectedRecordVersion: 1 });

    expect(save).toHaveBeenCalledOnce();
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isTransitioning).toBe(false);
  });

  it('announces a saved draft, a conflict, and a failure differently', () => {
    renderHook(() => useAssessmentWorkflowActions('t', 'a'));

    saveCallbacks.onSuccess();
    saveCallbacks.onConflict();
    saveCallbacks.onError();

    expect(showToast.mock.calls.map((call) => (call[0] as { tone: string }).tone)).toEqual([
      'success',
      'warning',
      'danger',
    ]);
  });

  it('announces publication separately from submission', () => {
    renderHook(() => useAssessmentWorkflowActions('t', 'a'));

    workflowCallbacks.onSuccess(detail('published'));
    workflowCallbacks.onSuccess(detail('submitted'));
    workflowCallbacks.onError();

    const messages = showToast.mock.calls.map((call) => (call[0] as { message: string }).message);
    expect(messages[0]).not.toBe(messages[1]);
    expect(messages).toHaveLength(3);
  });
});

describe('useDevelopmentActions', () => {
  it('acknowledges one feedback record with its clarification flag', () => {
    const { result } = renderHook(() => useDevelopmentActions('t', []));

    result.current.acknowledge('f1', true);

    expect(acknowledge).toHaveBeenCalledExactlyOnceWith({
      feedbackId: 'f1',
      clarificationRequested: true,
    });
  });

  it('transitions a goal against its own record version', () => {
    const goals = [buildDevelopmentGoal()];
    const { result } = renderHook(() => useDevelopmentActions('t', goals));

    result.current.transitionGoal('goal-2');

    expect(runGoal).toHaveBeenCalledExactlyOnceWith({
      goalId: 'goal-2',
      transition: 'achieve',
      expectedRecordVersion: 2,
    });
  });

  it('ignores a transition for a goal it no longer holds', () => {
    const { result } = renderHook(() => useDevelopmentActions('t', []));

    result.current.transitionGoal('missing');

    expect(runGoal).not.toHaveBeenCalled();
  });

  it('ignores a transition for a goal whose lifecycle offers none', () => {
    const base = buildDevelopmentGoal();
    const closed = { ...base, goal: { ...base.goal, status: 'achieved' as const } };
    const { result } = renderHook(() => useDevelopmentActions('t', [closed]));

    result.current.transitionGoal('goal-2');

    expect(runGoal).not.toHaveBeenCalled();
  });

  it('announces acknowledgement and goal outcomes', () => {
    const { result } = renderHook(() => useDevelopmentActions('t', []));

    ackCallbacks.onSuccess();
    ackCallbacks.onError();
    goalCallbacks.onSuccess();
    goalCallbacks.onError();

    expect(showToast).toHaveBeenCalledTimes(4);
    expect(result.current.isAcknowledging).toBe(false);
    expect(result.current.isTransitioningGoal).toBe(false);
  });
});
