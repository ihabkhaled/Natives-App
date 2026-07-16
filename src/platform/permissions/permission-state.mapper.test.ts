import { describe, expect, it } from 'vitest';

import { mapRawPermissionState, PERMISSION_STATUS } from './permission-state.mapper';

describe('PERMISSION_STATUS', () => {
  it('pins the app permission taxonomy', () => {
    expect(PERMISSION_STATUS).toEqual({
      Granted: 'granted',
      Denied: 'denied',
      NeedsRequest: 'needs-request',
      Unknown: 'unknown',
    });
  });
});

describe('mapRawPermissionState', () => {
  it.each(['granted', 'limited'])('treats the %s plugin state as granted', (rawState) => {
    expect(mapRawPermissionState(rawState)).toBe(PERMISSION_STATUS.Granted);
  });

  it('maps denied to denied', () => {
    expect(mapRawPermissionState('denied')).toBe(PERMISSION_STATUS.Denied);
  });

  it.each(['prompt', 'prompt-with-rationale'])(
    'treats the %s plugin state as needing a request',
    (rawState) => {
      expect(mapRawPermissionState(rawState)).toBe(PERMISSION_STATUS.NeedsRequest);
    },
  );

  it.each(['', 'GRANTED', 'unsupported', 'undetermined'])(
    'falls back to unknown for the unrecognized %s state',
    (rawState) => {
      expect(mapRawPermissionState(rawState)).toBe(PERMISSION_STATUS.Unknown);
    },
  );
});
