import { useState } from 'react';

import {
  applyDraftEdit,
  clearDraftValue,
  mergeDraftEdits,
  parseNumericInput,
  parseTextInput,
  readDraftValue,
  toDraftValues,
} from '../helpers/assessment-value.helper';
import type { AssessmentDetail, AssessmentValueDraft } from '../types/assessments.types';

export interface AssessmentDraftView {
  readonly draft: Readonly<Record<string, AssessmentValueDraft>>;
  readonly summary: string;
  readonly setScore: (metricDefinitionId: string, score: number) => void;
  readonly setNumeric: (metricDefinitionId: string, raw: string) => void;
  readonly setText: (metricDefinitionId: string, raw: string) => void;
  readonly setNote: (metricDefinitionId: string, raw: string) => void;
  readonly clear: (metricDefinitionId: string) => void;
  readonly setSummary: (raw: string) => void;
}

/**
 * Local draft state for the evaluator grid. Edits are held as an overlay on
 * top of the server values and merged during render, so no effect ever
 * synchronizes state and a refetch never clobbers an in-flight edit.
 *
 * Every setter routes through the null-not-zero helpers: clearing a field
 * records "not evaluated", and a blank numeric input is unknown rather than a
 * scored zero.
 */
export function useAssessmentDraft(detail: AssessmentDetail | undefined): AssessmentDraftView {
  const [edits, setEdits] = useState<Readonly<Record<string, AssessmentValueDraft>>>({});
  const [summaryEdit, setSummaryEdit] = useState<string | null>(null);
  const draft = mergeDraftEdits(toDraftValues(detail?.values ?? []), edits);

  const edit = (metricDefinitionId: string, patch: Partial<AssessmentValueDraft>): void => {
    setEdits(applyDraftEdit(draft, { ...readDraftValue(draft, metricDefinitionId), ...patch }));
  };

  return {
    draft,
    summary: summaryEdit ?? detail?.assessment.summary ?? '',
    setScore: (metricDefinitionId, score) => {
      edit(metricDefinitionId, { numericValue: score, textValue: null });
    },
    setNumeric: (metricDefinitionId, raw) => {
      edit(metricDefinitionId, { numericValue: parseNumericInput(raw), textValue: null });
    },
    setText: (metricDefinitionId, raw) => {
      edit(metricDefinitionId, { numericValue: null, textValue: parseTextInput(raw) });
    },
    setNote: (metricDefinitionId, raw) => {
      edit(metricDefinitionId, { note: parseTextInput(raw) });
    },
    clear: (metricDefinitionId) => {
      setEdits(clearDraftValue(draft, metricDefinitionId));
    },
    setSummary: setSummaryEdit,
  };
}
