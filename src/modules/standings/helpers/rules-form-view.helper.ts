import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { STANDING_TIE_BREAKS, type StandingTieBreak } from '../constants/standings.constants';
import { resolveTieBreakLabel } from './rules-view.helper';
import type { RuleFormView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The raw text + order state of the publish-next-version form. */
export interface RuleDraft {
  readonly ruleKey: string;
  readonly name: string;
  readonly winPoints: string;
  readonly lossPoints: string;
  readonly tiePoints: string;
  readonly tieBreakOrder: readonly StandingTieBreak[];
}

/** A blank draft: standard 3/0/1 scoring and the full tie-break order. */
export function blankRuleDraft(): RuleDraft {
  return {
    ruleKey: '',
    name: '',
    winPoints: '3',
    lossPoints: '0',
    tiePoints: '1',
    tieBreakOrder: STANDING_TIE_BREAKS,
  };
}

/** A point value within the DTO bounds, or null when it fails them. */
export function toRulePoints(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= -10 && parsed <= 10 ? parsed : null;
}

/** Whether every field of a draft is valid enough to publish. */
export function isRuleDraftValid(draft: RuleDraft): boolean {
  return (
    draft.ruleKey.trim().length >= 2 &&
    draft.name.trim().length >= 2 &&
    toRulePoints(draft.winPoints) !== null &&
    toRulePoints(draft.lossPoints) !== null &&
    toRulePoints(draft.tiePoints) !== null
  );
}

/** Resolved state + callbacks the rule form binds. */
export interface RuleFormInputs {
  readonly draft: RuleDraft;
  readonly validationMessage: string | null;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly patch: (patch: Partial<RuleDraft>) => void;
  readonly onMoveTieBreak: (index: number, direction: -1 | 1) => void;
  readonly onSubmit: () => void;
}

function buildPointFields(
  t: Translate,
  draft: RuleDraft,
  patch: (patch: Partial<RuleDraft>) => void,
) {
  return [
    {
      id: 'rule-win-points',
      label: t(I18N_KEYS.standings.ruleWinPoints, { points: draft.winPoints }),
      value: draft.winPoints,
      onChange: (value: string) => {
        patch({ winPoints: value });
      },
    },
    {
      id: 'rule-loss-points',
      label: t(I18N_KEYS.standings.ruleLossPoints, { points: draft.lossPoints }),
      value: draft.lossPoints,
      onChange: (value: string) => {
        patch({ lossPoints: value });
      },
    },
    {
      id: 'rule-tie-points',
      label: t(I18N_KEYS.standings.ruleTiePoints, { points: draft.tiePoints }),
      value: draft.tiePoints,
      onChange: (value: string) => {
        patch({ tiePoints: value });
      },
    },
  ];
}

export function buildRuleFormView(t: Translate, inputs: RuleFormInputs): RuleFormView {
  const { draft, patch } = inputs;
  return {
    heading: t(I18N_KEYS.standings.ruleFormHeading),
    keyLabel: t(I18N_KEYS.standings.ruleFormKeyLabel),
    keyHint: t(I18N_KEYS.standings.ruleFormKeyHint),
    keyValue: draft.ruleKey,
    onKeyChange: (value) => {
      patch({ ruleKey: value });
    },
    nameLabel: t(I18N_KEYS.standings.ruleFormNameLabel),
    nameValue: draft.name,
    onNameChange: (value) => {
      patch({ name: value });
    },
    pointFields: buildPointFields(t, draft, patch),
    tieBreakHeading: t(I18N_KEYS.standings.ruleTieBreakHeading),
    tieBreakRows: draft.tieBreakOrder.map((tieBreak) => ({
      key: tieBreak,
      label: resolveTieBreakLabel(t, tieBreak),
    })),
    onMoveTieBreak: inputs.onMoveTieBreak,
    moveUpLabel: t(I18N_KEYS.standings.tieBreakMoveUp),
    moveDownLabel: t(I18N_KEYS.standings.tieBreakMoveDown),
    validationMessage: inputs.validationMessage,
    submitLabel: t(I18N_KEYS.standings.ruleFormSubmit),
    canSubmit: inputs.canSubmit,
    isSaving: inputs.isSaving,
    onSubmit: inputs.onSubmit,
  };
}
