import { useMemo } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { buildWorkbenchItems, type WorkbenchItem } from '../helpers/workbench-items.helper';
import { useWorkbenchForm, type WorkbenchFormView } from './use-workbench-form.hook';

const WORKBENCH_LIST_SIZE = 500;

export interface WorkbenchScreenView {
  readonly title: string;
  readonly buttonsSection: string;
  readonly buttonPrimary: string;
  readonly buttonSecondary: string;
  readonly buttonDanger: string;
  readonly formSection: string;
  readonly formNameLabel: string;
  readonly formEmailLabel: string;
  readonly formSubmit: string;
  readonly formSuccessMessage: string | undefined;
  readonly form: WorkbenchFormView;
  readonly statesSection: string;
  readonly stateLabels: {
    readonly loading: string;
    readonly emptyTitle: string;
    readonly emptyMessage: string;
    readonly errorTitle: string;
    readonly retry: string;
    readonly offlineTitle: string;
    readonly offlineMessage: string;
    readonly permissionTitle: string;
    readonly permissionMessage: string;
  };
  readonly onStateRetryDemo: () => void;
  readonly listSection: string;
  readonly items: readonly WorkbenchItem[];
}

/** Prepared, translated view model for the UI workbench. */
export function useWorkbenchScreen(): WorkbenchScreenView {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const form = useWorkbenchForm({ translate: t });
  const items = useMemo(
    () =>
      buildWorkbenchItems(WORKBENCH_LIST_SIZE, (index) =>
        t(I18N_KEYS.workbench.listItemTitle, { index }),
      ),
    [t],
  );
  return {
    title: t(I18N_KEYS.workbench.title),
    buttonsSection: t(I18N_KEYS.workbench.buttonsSection),
    buttonPrimary: t(I18N_KEYS.workbench.buttonPrimary),
    buttonSecondary: t(I18N_KEYS.workbench.buttonSecondary),
    buttonDanger: t(I18N_KEYS.workbench.buttonDanger),
    formSection: t(I18N_KEYS.workbench.formSection),
    formNameLabel: t(I18N_KEYS.workbench.formNameLabel),
    formEmailLabel: t(I18N_KEYS.workbench.formEmailLabel),
    formSubmit: t(I18N_KEYS.workbench.formSubmit),
    formSuccessMessage:
      form.submittedName === undefined
        ? undefined
        : t(I18N_KEYS.workbench.formSuccess, { name: form.submittedName }),
    form,
    statesSection: t(I18N_KEYS.workbench.statesSection),
    stateLabels: {
      loading: t(I18N_KEYS.common.loading),
      emptyTitle: t(I18N_KEYS.states.emptyTitle),
      emptyMessage: t(I18N_KEYS.states.emptyMessage),
      errorTitle: t(I18N_KEYS.states.errorTitle),
      retry: t(I18N_KEYS.common.retry),
      offlineTitle: t(I18N_KEYS.states.offlineTitle),
      offlineMessage: t(I18N_KEYS.states.offlineMessage),
      permissionTitle: t(I18N_KEYS.states.permissionTitle),
      permissionMessage: t(I18N_KEYS.states.permissionMessage),
    },
    onStateRetryDemo: () => {
      void showToast({ message: t(I18N_KEYS.common.retry), tone: 'neutral' });
    },
    listSection: t(I18N_KEYS.workbench.listSection),
    items,
  };
}
