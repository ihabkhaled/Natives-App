import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppQueryClient, QueryClientProvider } from '@/packages/query';
import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';

import { generateReport } from '../services/generate-report.service';
import { useReportRequest } from './use-report-request.hook';
import type { ReportsContextView } from './use-reports-context.hook';

vi.mock('../services/generate-report.service', () => ({ generateReport: vi.fn() }));
vi.mock('@/modules/teams', () => ({
  buildSeasonsQueryOptions: () => ({ queryKey: ['seasons'], queryFn: () => [], enabled: false }),
}));

function wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <QueryClientProvider client={createAppQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const t = (key: string): string => key;

const context: ReportsContextView = {
  teamId: 't1',
  isOffline: false,
  canRead: true,
  canGenerate: true,
  isLoading: false,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useReportRequest error handling', () => {
  it('maps a validation refusal to the validation copy', async () => {
    vi.mocked(generateReport).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Validation,
        message: 'x',
        messageKey: 'errors.reports.validation',
      }),
    );
    const { result } = renderHook(
      () =>
        useReportRequest(t, {
          context,
          onQueued: vi.fn(),
          prefillTemplate: null,
          onPrefillConsumed: vi.fn(),
        }),
      { wrapper },
    );
    act(() => result.current?.onSubmit());
    await waitFor(() => {
      expect(result.current?.validationMessage).toBe('reports.requestValidation');
    });
  });

  it('maps a generic failure to the request-failed copy and consumes a prefill', async () => {
    vi.mocked(generateReport).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(
      () =>
        useReportRequest(t, {
          context,
          onQueued: vi.fn(),
          prefillTemplate: 'roster',
          onPrefillConsumed: vi.fn(),
        }),
      { wrapper },
    );
    act(() =>
      result.current?.templates.find((template) => template.template === 'analysis')?.onSelect(),
    );
    act(() => result.current?.onSubmit());
    await waitFor(() => {
      expect(result.current?.validationMessage).toBe('reports.requestFailed');
    });
  });

  it('is absent without report.generate', () => {
    const { result } = renderHook(
      () =>
        useReportRequest(t, {
          context: { ...context, canGenerate: false },
          onQueued: vi.fn(),
          prefillTemplate: null,
          onPrefillConsumed: vi.fn(),
        }),
      { wrapper },
    );
    expect(result.current).toBeNull();
  });
});
