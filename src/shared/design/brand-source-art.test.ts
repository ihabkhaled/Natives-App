import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  BRAND_LOGO_DIMENSIONS,
  BRAND_LOGO_SOURCE_PATH,
  BRAND_LOGO_SOURCE_SHA256,
  BRAND_PWA_ICON_DERIVATIVES,
} from './brand-source.constants';

describe('brand source art', () => {
  it('commits the supplied logo unmodified against its pinned checksum', () => {
    const bytes = readFileSync(resolve(BRAND_LOGO_SOURCE_PATH));
    const digest = createHash('sha256').update(bytes).digest('hex');
    expect(digest).toBe(BRAND_LOGO_SOURCE_SHA256);
  });

  it('is a square PNG at the documented dimensions', () => {
    const bytes = readFileSync(resolve(BRAND_LOGO_SOURCE_PATH));
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    // PNG IHDR stores width at byte 16 and height at byte 20 (big-endian).
    expect(bytes.readUInt32BE(16)).toBe(BRAND_LOGO_DIMENSIONS.width);
    expect(bytes.readUInt32BE(20)).toBe(BRAND_LOGO_DIMENSIONS.height);
  });

  it.each(BRAND_PWA_ICON_DERIVATIVES)(
    'keeps generated PWA derivative $path reproducible',
    ({ path, width, height, sha256 }) => {
      const bytes = readFileSync(resolve(path));

      expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(bytes.readUInt32BE(16)).toBe(width);
      expect(bytes.readUInt32BE(20)).toBe(height);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(sha256);
    },
  );
});
