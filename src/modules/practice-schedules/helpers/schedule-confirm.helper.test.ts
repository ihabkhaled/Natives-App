import { describe, expect, it, vi } from 'vitest';

import { confirmThenRun } from './schedule-confirm.helper';

describe('confirmThenRun', () => {
  it('runs the command once the coach confirms', async () => {
    const run = vi.fn();
    const confirm = vi.fn().mockResolvedValue(true);

    confirmThenRun(confirm, { header: 'h', confirmLabel: 'ok', cancelLabel: 'no' }, run);
    await Promise.resolve();

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('never runs the command when the coach backs out', async () => {
    const run = vi.fn();
    const confirm = vi.fn().mockResolvedValue(false);

    confirmThenRun(confirm, { header: 'h', confirmLabel: 'ok', cancelLabel: 'no' }, run);
    await Promise.resolve();

    expect(run).not.toHaveBeenCalled();
  });
});
