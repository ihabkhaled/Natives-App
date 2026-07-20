import { MOCK_FEEDBACK_ID, MOCK_GOAL_IDS } from './assessments-data.fixture';

/** Deterministic coach feedback and development goal records. */
export interface FeedbackRecordFixture {
  id: string;
  status: 'draft' | 'in_review' | 'published' | 'revised';
  revision: number;
  positiveFrisbee: string | null;
  frisbeeImprovement: string | null;
  positiveMental: string | null;
  mentalImprovement: string | null;
  teamRole: string | null;
  recommendedPosition: string | null;
  summary: string | null;
  publishedAt: string | null;
  acknowledgedAt: string | null;
  clarificationRequested: boolean;
}

export function buildInitialFeedbackRecords(): FeedbackRecordFixture[] {
  return [
    {
      id: MOCK_FEEDBACK_ID,
      status: 'published',
      revision: 1,
      positiveFrisbee: 'Your break-side flick is now a genuine weapon.',
      frisbeeImprovement: 'Reset earlier when the mark shifts.',
      positiveMental: 'You lift the sideline every point.',
      mentalImprovement: 'Stay vocal after a turnover.',
      teamRole: 'Handler',
      recommendedPosition: 'Primary reset handler',
      summary: 'A strong block. Keep the reset timing work going.',
      publishedAt: '2026-07-12T12:00:00.000Z',
      acknowledgedAt: null,
      clarificationRequested: false,
    },
  ];
}

export interface GoalRecordFixture {
  id: string;
  title: string;
  description: string | null;
  measurableTarget: string | null;
  targetValue: number | null;
  baselineValue: number | null;
  progressValue: number | null;
  status: 'proposed' | 'active' | 'achieved' | 'missed' | 'cancelled';
  dueDate: string | null;
  recordVersion: number;
  actions: { description: string; sortOrder: number; done: boolean; dueDate: string | null }[];
}

export function buildInitialGoalRecords(): GoalRecordFixture[] {
  return [
    {
      id: MOCK_GOAL_IDS.active,
      title: 'Raise reset completion under pressure',
      description: 'Complete 90% of resets against a hard mark.',
      measurableTarget: '90% reset completion',
      targetValue: 90,
      baselineValue: 72,
      progressValue: 81,
      status: 'active',
      dueDate: '2026-08-31',
      recordVersion: 2,
      actions: [
        {
          description: 'Ten minutes of marked reset drills each practice',
          sortOrder: 1,
          done: true,
          dueDate: null,
        },
        {
          description: 'Film review with the handler group every fortnight',
          sortOrder: 2,
          done: false,
          dueDate: '2026-08-15',
        },
      ],
    },
    {
      id: MOCK_GOAL_IDS.proposed,
      title: 'Add a reliable inside-out backhand',
      description: null,
      measurableTarget: null,
      targetValue: null,
      baselineValue: null,
      progressValue: null,
      status: 'proposed',
      dueDate: null,
      recordVersion: 1,
      actions: [
        { description: 'Throwing session twice a week', sortOrder: 1, done: false, dueDate: null },
      ],
    },
  ];
}
