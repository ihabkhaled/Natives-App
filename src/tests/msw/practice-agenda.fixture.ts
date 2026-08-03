import type { AgendaBlock, PracticeAgenda } from '@/modules/practice-agenda';

/**
 * A published plan as a coach meets it: a warm-up with no stations, a drill
 * split across two stations, and an untimed discussion at the end.
 *
 * `position` is deliberately not 0,1,2 in array order — the fixture arrives
 * out of order so anything that trusts array order instead of `position`
 * fails loudly.
 */
const MOCK_AGENDA_BLOCKS: readonly AgendaBlock[] = [
  {
    id: 'block-2',
    drillId: 'drill-7',
    position: 2,
    title: 'Cutting drill',
    blockType: 'drill',
    offsetMinutes: 15,
    durationMinutes: 30,
    intensity: 'high',
    repetitions: 4,
    target: 'Clean first step',
    completionStatus: 'planned',
    completedAt: null,
    notes: 'Rotate the stations every eight minutes.',
    coachNotes: null,
    stations: [
      {
        id: 'station-2',
        blockId: 'block-2',
        drillId: null,
        groupId: 'group-2',
        coachMembershipId: null,
        position: 2,
        name: 'Deep cuts',
        repetitions: 4,
        target: 'Away from the disc',
        notes: null,
        completionStatus: 'planned',
      },
      {
        id: 'station-1',
        blockId: 'block-2',
        drillId: 'drill-9',
        groupId: 'group-1',
        coachMembershipId: 'membership-3',
        position: 1,
        name: 'Under cuts',
        repetitions: 6,
        target: 'Sharp change of pace',
        notes: 'Two lines, alternate sides.',
        completionStatus: 'planned',
      },
    ],
  },
  {
    id: 'block-1',
    drillId: null,
    position: 1,
    title: 'Warm-up',
    blockType: 'warmup',
    offsetMinutes: 0,
    durationMinutes: 15,
    intensity: 'low',
    repetitions: null,
    target: null,
    completionStatus: 'completed',
    completedAt: '2026-08-03T17:15:00.000Z',
    notes: null,
    coachNotes: 'Watch the two returning from injury.',
    stations: [],
  },
  {
    id: 'block-3',
    drillId: null,
    position: 3,
    title: 'Film and questions',
    blockType: 'discussion',
    offsetMinutes: 45,
    durationMinutes: null,
    intensity: null,
    repetitions: null,
    target: null,
    completionStatus: 'planned',
    completedAt: null,
    notes: null,
    coachNotes: null,
    stations: [],
  },
];

/** The published plan for the mock session. */
export const MOCK_PRACTICE_AGENDA: PracticeAgenda = {
  sessionId: 'session-1',
  agendaId: 'agenda-1',
  status: 'published',
  theme: 'Cutting and continuation',
  notes: null,
  publishedAt: '2026-08-02T09:00:00.000Z',
  completedAt: null,
  version: 4,
  blocks: [...MOCK_AGENDA_BLOCKS],
};
