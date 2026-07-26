import { describe, expect, it } from 'vitest';

import { buildDownloadToastMessage, checksumTail } from './report-download.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

describe('checksumTail', () => {
  it('returns the last eight characters of a long checksum', () => {
    expect(checksumTail('sha256:0123456789abcdef')).toBe('89abcdef');
  });

  it('returns a short checksum unchanged', () => {
    expect(checksumTail('abc')).toBe('abc');
  });
});

describe('buildDownloadToastMessage', () => {
  it('cites the checksum tail in the 15-minute toast', () => {
    expect(buildDownloadToastMessage(t, 'sha256:0123456789abcdef')).toBe(
      'reports.downloadToast:89abcdef',
    );
  });
});
