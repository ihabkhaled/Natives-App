import { beforeEach, describe, expect, it, vi } from 'vitest';

import { shareContent } from './capacitor-share.facade';

const { share } = vi.hoisted(() => ({
  share: vi.fn<(options: { title?: string; text?: string; url?: string }) => Promise<unknown>>(),
}));

vi.mock('@capacitor/share', () => ({ Share: { share } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('shareContent', () => {
  it('forwards the request to the plugin and reports success', async () => {
    const request = { title: 'Ranger', text: 'Look at this', url: 'https://example.com' };

    await expect(shareContent(request)).resolves.toBe(true);
    expect(share).toHaveBeenCalledExactlyOnceWith(request);
  });

  it('supports a url-only request', async () => {
    await expect(shareContent({ url: 'https://example.com' })).resolves.toBe(true);
    expect(share).toHaveBeenCalledExactlyOnceWith({ url: 'https://example.com' });
  });

  it('reports false when the user cancels', async () => {
    share.mockRejectedValue(new Error('Share canceled'));

    await expect(shareContent({ text: 'nope' })).resolves.toBe(false);
  });

  it('reports false when sharing is unavailable', async () => {
    share.mockRejectedValue(new Error('not implemented on web'));

    await expect(shareContent({ text: 'nope' })).resolves.toBe(false);
  });
});
