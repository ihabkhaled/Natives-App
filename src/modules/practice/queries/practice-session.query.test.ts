import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPracticeSession } from '../services/get-practice-session.service';
import { practiceQueryKeys } from './practice.keys';
import { buildPracticeSessionQueryOptions } from './practice-session.query';

vi.mock('../services/get-practice-session.service', () => ({ getPracticeSession: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildPracticeSessionQueryOptions', () => {
  it('keys the query by the session id and enables it', () => {
    const options = buildPracticeSessionQueryOptions('team-1', 'sess-7');

    expect(options.queryKey).toEqual(practiceQueryKeys.detail('team-1', 'sess-7'));
    expect(options.enabled).toBe(true);
  });

  it('stays disabled for an empty id', () => {
    expect(buildPracticeSessionQueryOptions('team-1', '').enabled).toBe(false);
    expect(buildPracticeSessionQueryOptions('', 'sess-7').enabled).toBe(false);
  });

  it('runs the detail use case', async () => {
    vi.mocked(getPracticeSession).mockResolvedValue({} as never);

    await buildPracticeSessionQueryOptions('team-1', 'sess-7').queryFn();

    expect(getPracticeSession).toHaveBeenCalledWith('team-1', 'sess-7');
  });
});
