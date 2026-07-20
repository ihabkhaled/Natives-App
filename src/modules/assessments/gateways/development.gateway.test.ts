import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestAcknowledgeFeedback,
  requestMyDevelopmentGoals,
  requestMyFeedback,
  requestTransitionGoal,
} from './development.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn().mockResolvedValue({});
const post = vi.fn().mockResolvedValue({});

vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);
});

describe('development.gateway', () => {
  it('reads the own feedback and goals with bounded params', async () => {
    await requestMyFeedback('t', 20, 0);
    await requestMyDevelopmentGoals('t', 20, 10);

    expect(get.mock.calls[0]?.[0]).toBe('/teams/t/my-feedback');
    expect(get.mock.calls[1]?.[0]).toBe('/teams/t/my-development-goals');
    expect((get.mock.calls[1]?.[2] as { params: object }).params).toEqual({
      limit: 20,
      offset: 10,
    });
  });

  it('acknowledges one feedback record with an encoded id', async () => {
    await requestAcknowledgeFeedback('t', 'f/1', true);

    expect(post.mock.calls[0]?.[0]).toBe('/teams/t/my-feedback/f%2F1/acknowledge');
    expect(post.mock.calls[0]?.[1]).toEqual({ clarificationRequested: true });
  });

  it('transitions one goal under optimistic concurrency', async () => {
    await requestTransitionGoal('t', 'g1', 'achieve', 4);

    expect(post.mock.calls[0]?.[0]).toBe('/teams/t/development-goals/g1/transition');
    expect(post.mock.calls[0]?.[1]).toEqual({ transition: 'achieve', expectedRecordVersion: 4 });
  });
});
