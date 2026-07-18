import { afterEach, describe, expect, it, vi } from 'vitest';

import { PRACTICE_SCOPE } from '../constants/practice.constants';
import { listPracticeSessions } from '../services/list-practice-sessions.service';
import { practiceQueryKeys } from './practice.keys';
import { buildPracticeSessionsQueryOptions } from './practice-sessions.query';

vi.mock('../services/list-practice-sessions.service', () => ({ listPracticeSessions: vi.fn() }));

const PARAMS = {
  scope: PRACTICE_SCOPE.upcoming,
  type: null,
  rsvp: null,
  pageSize: 20,
} as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildPracticeSessionsQueryOptions', () => {
  it('keys the query by the params', () => {
    expect(buildPracticeSessionsQueryOptions(PARAMS).queryKey).toEqual(
      practiceQueryKeys.sessions(PARAMS),
    );
  });

  it('runs the list use case', async () => {
    vi.mocked(listPracticeSessions).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    });

    await buildPracticeSessionsQueryOptions(PARAMS).queryFn();

    expect(listPracticeSessions).toHaveBeenCalledWith(PARAMS);
  });

  it('keeps the previous page as placeholder data', () => {
    const previous = { items: [], page: 1, pageSize: 20, total: 0, hasMore: false } as const;

    expect(buildPracticeSessionsQueryOptions(PARAMS).placeholderData(previous)).toBe(previous);
  });
});
