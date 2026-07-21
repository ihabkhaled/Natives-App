import { useState } from 'react';

import { buildMembersDirectoryQueryOptions, type MemberDirectoryPage } from '@/modules/members';
import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useAppQuery, useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ADMIN_LIMITS, type RuleTransition } from '../constants/admin.constants';
import { buildMemberOptions } from '../helpers/roles-view.helper';
import {
  buildEntryRows,
  buildSimulationActions,
  buildSimulationRows,
  buildTransitionActions,
} from '../helpers/rule-view.helper';
import { adminQueryKeys } from '../queries/admin.keys';
import { simulateRule } from '../services/simulate-rule.service';
import { transitionRule } from '../services/transition-rule.service';
import type {
  GovernedRule,
  RuleTransitionCommand,
  SimulationCommand,
  SimulationResult,
} from '../types/admin.types';
import type { RuleDetailView, AdminContextView } from '../types/admin-view.types';

/**
 * One rule version's lifecycle and its dry run. Publishing stays disabled
 * until a simulation has been seen — activation without a preview is refused
 * here and by the server.
 */
export function useRuleDetail(
  context: AdminContextView,
  family: string,
  rule: GovernedRule | null,
): RuleDetailView | null {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [membershipId, setMembershipId] = useState<string>('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const directory = useAppQuery<MemberDirectoryPage>(
    buildMembersDirectoryQueryOptions(context.teamId, { pageSize: ADMIN_LIMITS.members }),
  );
  // The command carries the rule id rather than closing over the possibly-null
  // `rule`, so there is no unreachable fallback for a rule that is not there.
  const dryRun = useAppMutation<SimulationResult, SimulationCommand>({
    mutationFn: (command) => simulateRule(context.teamId, command.ruleId, command.membershipId),
    onSuccess: (result) => {
      setSimulation(result);
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.adminRules.errorMessage), tone: 'danger' });
    },
  });
  const transition = useInvalidatingMutation<GovernedRule, RuleTransitionCommand>({
    mutationFn: (command) => transitionRule(context.teamId, family, command),
    invalidateKey: adminQueryKeys.rules(context.teamId, family),
    onSuccess: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminRules.transitionSavedToast),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminRules.transitionFailedToast),
        tone: 'danger',
      });
    },
  });

  if (rule === null) {
    return null;
  }
  const hasSimulated = simulation !== null;
  return {
    heading: rule.name,
    entriesHeading: t(I18N_KEYS.adminRules.entriesHeading),
    entriesIntro: t(I18N_KEYS.adminRules.entriesIntro),
    entryRows: buildEntryRows(t, rule.pointEntries),
    lifecycleHeading: t(I18N_KEYS.adminRules.lifecycleHeading),
    lifecycleIntro: t(I18N_KEYS.adminRules.lifecycleIntro),
    publishBlockedNotice: hasSimulated ? null : t(I18N_KEYS.adminRules.publishBlockedNotice),
    actions: buildTransitionActions(
      t,
      {
        status: rule.status,
        hasSimulated,
        canManage: context.canManageRules,
        isRunning: transition.isRunning,
      },
      (target: RuleTransition) => {
        transition.run({
          ruleId: rule.ruleId,
          transition: target,
          expectedRecordVersion: rule.recordVersion,
        });
      },
    ),
    simulation: buildSimulationActions(t, {
      memberValue: membershipId,
      memberOptions: buildMemberOptions(directory.data?.items ?? []),
      isRunning: dryRun.isPending,
      rows: buildSimulationRows(t, simulation),
      onMemberChange: setMembershipId,
      onRun: () => {
        if (membershipId !== '') {
          dryRun.mutate({ ruleId: rule.ruleId, membershipId });
        }
      },
    }),
  };
}
