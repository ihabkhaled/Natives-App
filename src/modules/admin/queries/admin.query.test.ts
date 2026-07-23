import { afterEach, describe, expect, it, vi } from 'vitest';

import { listDeadLetters } from '../services/list-dead-letters.service';
import { listJobHealth } from '../services/list-job-health.service';
import { buildDeadLettersQueryOptions, buildJobHealthQueryOptions } from './admin.query';

vi.mock('../services/list-dead-letters.service', () => ({ listDeadLetters: vi.fn() }));
vi.mock('../services/list-job-health.service', () => ({ listJobHealth: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('operations query options', () => {
  it('issues both reads for a granted principal now the backend serves them', () => {
    // Contract 1.2.0 shipped `admin/outbox/dead-letters` and
    // `admin/jobs/health` for real, so the capability-honesty markers are OFF
    // and only the grant decides. The marker machinery stays wired for the
    // next latent surface.
    expect(buildDeadLettersQueryOptions(true).enabled).toBe(true);
    expect(buildJobHealthQueryOptions(true).enabled).toBe(true);
    expect(buildDeadLettersQueryOptions(false).enabled).toBe(false);
    expect(buildJobHealthQueryOptions(false).enabled).toBe(false);
  });

  it('wires the dead-letter use case behind the live read', () => {
    void buildDeadLettersQueryOptions(true).queryFn();

    expect(listDeadLetters).toHaveBeenCalledOnce();
  });

  it('wires the job-health use case behind the live read', () => {
    void buildJobHealthQueryOptions(true).queryFn();

    expect(listJobHealth).toHaveBeenCalledOnce();
  });
});
