import { afterEach, describe, expect, it, vi } from 'vitest';

import { listDeadLetters } from '../services/list-dead-letters.service';
import { listJobHealth } from '../services/list-job-health.service';
import { buildDeadLettersQueryOptions, buildJobHealthQueryOptions } from './admin.query';

vi.mock('../services/list-dead-letters.service', () => ({ listDeadLetters: vi.fn() }));
vi.mock('../services/list-job-health.service', () => ({ listJobHealth: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('backend-pending operations query options', () => {
  it('suppresses the backend-pending reads regardless of grants', () => {
    // Capability honesty (recovery audit P1-4): `admin/outbox/dead-letters`
    // and `admin/jobs/health` 404 in production, so the requests must not
    // fire even WITH the outbox grant. Flipping the ADMIN_BACKEND_PENDING
    // marker is the single switch that lights these panels up again.
    expect(buildDeadLettersQueryOptions(true).enabled).toBe(false);
    expect(buildJobHealthQueryOptions(true).enabled).toBe(false);
    expect(buildDeadLettersQueryOptions(false).enabled).toBe(false);
    expect(buildJobHealthQueryOptions(false).enabled).toBe(false);
  });

  it('keeps the dead-letter use case wired for the P1 re-light', () => {
    void buildDeadLettersQueryOptions(true).queryFn();

    expect(listDeadLetters).toHaveBeenCalledOnce();
  });

  it('keeps the job-health use case wired for the P1 re-light', () => {
    void buildJobHealthQueryOptions(true).queryFn();

    expect(listJobHealth).toHaveBeenCalledOnce();
  });
});
