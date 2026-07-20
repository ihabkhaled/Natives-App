import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { buildAssessmentDetail } from '../../../../tests/factories/assessments.factory';
import { useAssessmentDraft } from './use-assessment-draft.hook';

describe('useAssessmentDraft', () => {
  it('seeds from the server values, keeping a scored zero', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    expect(result.current.draft['metric-speed']?.numericValue).toBe(4);
    expect(result.current.draft['metric-attitude']?.numericValue).toBe(0);
  });

  it('starts empty before the record resolves', () => {
    const { result } = renderHook(() => useAssessmentDraft(undefined));

    expect(result.current.draft).toEqual({});
    expect(result.current.summary).toBe('');
  });

  it('records a score selection', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    act(() => {
      result.current.setScore('metric-speed', 2);
    });

    expect(result.current.draft['metric-speed']?.numericValue).toBe(2);
  });

  it('parses a blank numeric input as not evaluated, never zero', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    act(() => {
      result.current.setNumeric('metric-speed', '   ');
    });

    expect(result.current.draft['metric-speed']?.numericValue).toBeNull();
  });

  it('records free text and clears any number alongside it', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    act(() => {
      result.current.setText('metric-speed', ' steady ');
    });

    expect(result.current.draft['metric-speed']).toMatchObject({
      numericValue: null,
      textValue: 'steady',
    });
  });

  it('records an evidence note without touching the value', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    act(() => {
      result.current.setNote('metric-speed', 'observed twice');
    });

    expect(result.current.draft['metric-speed']).toMatchObject({
      numericValue: 4,
      note: 'observed twice',
    });
  });

  it('clears a metric back to not evaluated while keeping its note', () => {
    const { result } = renderHook(() => useAssessmentDraft(buildAssessmentDetail()));

    act(() => {
      result.current.setNote('metric-speed', 'observed twice');
    });
    act(() => {
      result.current.clear('metric-speed');
    });

    expect(result.current.draft['metric-speed']).toMatchObject({
      numericValue: null,
      textValue: null,
      note: 'observed twice',
    });
  });

  it('keeps an in-flight edit when the server values refetch identically', () => {
    const { result, rerender } = renderHook(
      (detail: ReturnType<typeof buildAssessmentDetail> | undefined) => useAssessmentDraft(detail),
      { initialProps: buildAssessmentDetail() },
    );

    act(() => {
      result.current.setScore('metric-speed', 1);
    });
    rerender(buildAssessmentDetail());

    expect(result.current.draft['metric-speed']?.numericValue).toBe(1);
  });

  it('falls back to the server summary until the evaluator edits it', () => {
    const base = buildAssessmentDetail();
    const { result } = renderHook(() =>
      useAssessmentDraft({
        ...base,
        assessment: { ...base.assessment, summary: 'from the server' },
      }),
    );

    expect(result.current.summary).toBe('from the server');

    act(() => {
      result.current.setSummary('mine');
    });

    expect(result.current.summary).toBe('mine');
  });
});
