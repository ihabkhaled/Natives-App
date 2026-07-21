import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyTextToClipboard } from './clipboard.facade';

const originalClipboard = Object.getOwnPropertyDescriptor(globalThis.navigator, 'clipboard');

function stubClipboard(value: unknown): void {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  if (originalClipboard === undefined) {
    Reflect.deleteProperty(globalThis.navigator, 'clipboard');
    return;
  }
  Object.defineProperty(globalThis.navigator, 'clipboard', originalClipboard);
});

describe('copyTextToClipboard', () => {
  it('copies the text and reports success', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard({ writeText });

    await expect(copyTextToClipboard('https://app.example.com/accept')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledExactlyOnceWith('https://app.example.com/accept');
  });

  it('reports failure instead of throwing when the browser refuses', async () => {
    stubClipboard({ writeText: vi.fn(() => Promise.reject(new Error('denied'))) });

    await expect(copyTextToClipboard('link')).resolves.toBe(false);
  });

  it('reports failure when there is no Clipboard API at all', async () => {
    stubClipboard(undefined);

    await expect(copyTextToClipboard('link')).resolves.toBe(false);
  });
});
