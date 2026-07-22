import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestReplayEvent } from '../gateways/operations.gateway';
import { replayDeadLetter } from './replay-dead-letter.service';

vi.mock('../gateways/operations.gateway', () => ({ requestReplayEvent: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('replayDeadLetter', () => {
  it('re-queues strictly by event id and reports the server verdict', async () => {
    vi.mocked(requestReplayEvent).mockResolvedValue({
      eventId: 'evt-1',
      requeued: true,
    });

    await expect(replayDeadLetter('evt-1')).resolves.toBe(true);
    expect(requestReplayEvent).toHaveBeenCalledExactlyOnceWith('evt-1');
  });

  it('normalizes a refusal into an AppError', async () => {
    vi.mocked(requestReplayEvent).mockRejectedValue(new Error('refused'));

    await expect(replayDeadLetter('evt-1')).rejects.toMatchObject({ name: 'AppError' });
  });
});
