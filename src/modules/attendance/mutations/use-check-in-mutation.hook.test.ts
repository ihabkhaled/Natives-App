import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { mapAttendanceSelfRecord } from '../mappers/attendance-self.mapper';
import { selfCheckIn } from '../services/self-check-in.service';
import { useCheckInMutation } from './use-check-in-mutation.hook';

vi.mock('../services/self-check-in.service', () => ({ selfCheckIn: vi.fn() }));

function renderCheckIn(note: string | null) {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  actOnHook(
    () => useCheckInMutation('team-1', 'sess-1', { onSuccess, onError }),
    (api) => {
      api.checkIn(note);
    },
  );
  return { onSuccess, onError };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCheckInMutation', () => {
  it('checks in with the optional note and reports success', async () => {
    vi.mocked(selfCheckIn).mockResolvedValue(
      mapAttendanceSelfRecord(makeSelfRecordDto({ status: 'present_on_time', source: 'self' })),
    );

    const { onSuccess } = renderCheckIn('warmed up early');

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(selfCheckIn).toHaveBeenCalledWith('team-1', 'sess-1', 'warmed up early');
  });

  it('routes a window-closed conflict to the error callback as an AppError', async () => {
    vi.mocked(selfCheckIn).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));

    const { onSuccess, onError } = renderCheckIn(null);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onError.mock.calls[0]?.[0]).toMatchObject({ code: APP_ERROR_CODE.Conflict });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
