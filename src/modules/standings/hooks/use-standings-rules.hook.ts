import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { moveArrayItem } from '@/shared/ui';
import { resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import { buildRuleFamilies } from '../helpers/rules-view.helper';
import {
  blankRuleDraft,
  buildRuleFormView,
  isRuleDraftValid,
  toRulePoints,
  type RuleDraft,
} from '../helpers/rules-form-view.helper';
import { buildStandingsScreenCopy } from '../helpers/standings-copy.helper';
import { resolveStandingsWriteErrorKey } from '../helpers/to-standings-error.helper';
import { useCreateStandingsRuleMutation } from '../mutations/use-create-standings-rule-mutation.hook';
import { buildStandingsRulesQueryOptions } from '../queries/standings.query';
import type { StandingsRulesPage } from '../types/standings.types';
import type { RuleFormView, StandingsRulesScreenView } from '../types/standings-view.types';
import { useStandingsContext } from './use-standings-context.hook';

/**
 * View model of the rules screen: families grouped newest-first, the
 * immutability invariant stated in copy, and — for competition.manage — the
 * publish-vN+1 form with a keyboard-operable tie-break order builder.
 */
export function useStandingsRules(): StandingsRulesScreenView {
  const { t, locale } = useAppTranslation();
  const context = useStandingsContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<RuleDraft>(blankRuleDraft);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const rulesQuery = toRemoteQueryView<StandingsRulesPage>(
    useAppQuery(buildStandingsRulesQueryOptions(context.teamId)),
  );
  const rules = rulesQuery.data?.rules ?? [];

  const createRule = useCreateStandingsRuleMutation(context.teamId, {
    onSuccess: () => {
      setFormOpen(false);
      setDraft(blankRuleDraft());
      setSavedBanner(t(I18N_KEYS.standings.ruleFormSaved));
    },
    onError: (error) => {
      setFormError(t(resolveStandingsWriteErrorKey(error, I18N_KEYS.standings.ruleFormFailed)));
    },
  });

  const submitRule = (): void => {
    const winPoints = toRulePoints(draft.winPoints);
    const lossPoints = toRulePoints(draft.lossPoints);
    const tiePoints = toRulePoints(draft.tiePoints);
    if (winPoints === null || lossPoints === null || tiePoints === null) {
      setFormError(t(I18N_KEYS.standings.ruleFormValidation));
      return;
    }
    createRule.run({
      ruleKey: draft.ruleKey.trim(),
      name: draft.name.trim(),
      winPoints,
      lossPoints,
      tiePoints,
      tieBreakOrder: draft.tieBreakOrder,
    });
  };

  const form: RuleFormView | null = !isFormOpen
    ? null
    : buildRuleFormView(t, {
        draft,
        validationMessage: formError,
        canSubmit: isRuleDraftValid(draft) && !context.isOffline,
        isSaving: createRule.isRunning,
        patch: (patch) => {
          setDraft((current) => ({ ...current, ...patch }));
        },
        onMoveTieBreak: (index, direction) => {
          setDraft((current) => ({
            ...current,
            tieBreakOrder: moveArrayItem(current.tieBreakOrder, index, direction),
          }));
        },
        onSubmit: submitRule,
      });

  return {
    ...buildStandingsScreenCopy(t, {
      error: rulesQuery.error,
      isOffline: context.isOffline,
      onRetry: rulesQuery.refetch,
      emptyTitleKey: I18N_KEYS.standings.rulesEmptyTitle,
      emptyMessageKey: I18N_KEYS.standings.rulesEmptyMessage,
    }),
    status: resolveScreenStatus(context, rulesQuery, context.canRead, rules.length > 0),
    title: t(I18N_KEYS.standings.rulesTitle),
    subtitle: t(I18N_KEYS.standings.rulesSubtitle),
    immutableNotice: t(I18N_KEYS.standings.rulesImmutableNotice),
    families: buildRuleFamilies(t, locale, rules),
    formToggleLabel: context.canManage ? t(I18N_KEYS.standings.ruleFormToggle) : null,
    isFormOpen,
    onToggleForm: () => {
      setFormError(null);
      setFormOpen((open) => !open);
    },
    form,
    savedBanner,
  };
}
