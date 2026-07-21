import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import { ADMIN_RULES_COPY } from '../constants/admin-labels.constants';
import { ALL_STATUSES_FILTER, RULE_FAMILIES } from '../constants/admin.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import {
  buildFamilyOptions,
  buildStatusOptions,
  filterRules,
} from '../helpers/rules-filter.helper';
import { buildRuleRows } from '../helpers/rule-view.helper';
import { buildRulesQueryOptions } from '../queries/admin.query';
import type { RulePage } from '../types/admin.types';
import type { AdminRulesView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';
import { useRuleDetail } from './use-rule-detail.hook';

/**
 * The rule governance workspace: both versioned families, their lifecycle
 * transitions, and the dry run that must precede an activation.
 */
export function useRulesWorkspace(): AdminRulesView {
  const { t } = useAppTranslation();
  const context = useAdminContext();
  const [family, setFamily] = useState<string>(RULE_FAMILIES[0]);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES_FILTER);
  const [selectedId, setSelectedId] = useState<string>('');
  const query = toRemoteQueryView(
    useAppQuery<RulePage>(buildRulesQueryOptions(context.teamId, family)),
  );
  const rules = query.data?.items ?? [];
  const matches = filterRules(rules, statusFilter);
  const selected = matches.find((rule) => rule.ruleId === selectedId) ?? null;
  const detail = useRuleDetail(context, family, selected);

  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_RULES_COPY,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.adminRules.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminRules.emptyMessage,
    }),
    title: t(I18N_KEYS.adminRules.title),
    subtitle: t(I18N_KEYS.adminRules.subtitle),
    status: resolveAdminScreenStatus(context, query, context.canManageRules, rules.length > 0),
    readOnlyNotice: context.canManageRules ? null : t(I18N_KEYS.adminRules.readOnlyNotice),
    familyLabel: t(I18N_KEYS.adminRules.familyFilterLabel),
    family,
    familyOptions: buildFamilyOptions(t),
    statusFilterLabel: t(I18N_KEYS.adminRules.statusFilterLabel),
    statusFilter,
    statusOptions: buildStatusOptions(t),
    countLabel: t(I18N_KEYS.adminRules.countLabel, { count: matches.length }),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.adminRules.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.adminRules.noMatchesMessage),
    rows: buildRuleRows(t, matches, selectedId),
    selectPrompt: t(I18N_KEYS.adminRules.selectPrompt),
    detail,
    onFamilyChange: (value: string) => {
      setFamily(value);
      setSelectedId('');
    },
    onStatusFilterChange: setStatusFilter,
    onSelect: setSelectedId,
  };
}
