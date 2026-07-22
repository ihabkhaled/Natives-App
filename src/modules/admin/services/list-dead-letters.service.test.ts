import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestDeadLetters } from '../gateways/operations.gateway';
import { listDeadLetters } from './list-dead-letters.service';

vi.mock('../gateways/operations.gateway', () => ({ requestDeadLetters: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

/**
 * Backend-pending use case: the operations centre never calls this while the
 * capability-honesty marker is on, but the use case stays ready (and pinned)
 * for the P1 re-light.
 */
describe('listDeadLetters', () => {
  it('maps the wire items to payload-free dead letters', async () => {
    vi.mocked(requestDeadLetters).mockResolvedValue({
      items: [
        {
          eventId: 'evt-1',
          eventType: 'notification.email.send',
          attempts: 5,
          failedAt: '2026-07-19T22:15:00.000Z',
          failureCode: 'SMTP_TIMEOUT',
        },
      ],
    } as never);

    const letters = await listDeadLetters();

    expect(requestDeadLetters).toHaveBeenCalledOnce();
    expect(letters).toEqual([
      {
        eventId: 'evt-1',
        eventType: 'notification.email.send',
        attempts: 5,
        failedAt: '2026-07-19T22:15:00.000Z',
        failureCode: 'SMTP_TIMEOUT',
      },
    ]);
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestDeadLetters).mockRejectedValue(new Error('boom'));

    await expect(listDeadLetters()).rejects.toMatchObject({ name: 'AppError' });
  });
});
