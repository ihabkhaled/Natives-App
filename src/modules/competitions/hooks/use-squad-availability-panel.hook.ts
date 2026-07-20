import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { AVAILABILITY_LABEL_KEYS } from '../constants/competitions-labels.constants';
import { AVAILABILITY_VALUES, type AvailabilityValue } from '../constants/competitions.constants';
import { buildAvailabilityRows } from '../helpers/roster-view.helper';
import { useDeclareAvailabilityMutation } from '../mutations/use-declare-availability-mutation.hook';
import type { AvailabilityPanelView } from '../types/competitions-view.types';
import type { AvailabilityPanelInput } from '../types/selection.types';
import { useSquadAvailabilityQuery } from './use-squad-availability-query.hook';

/**
 * The private availability experience: the caller declares their own state
 * for this squad's window and sees the declarations already recorded.
 */
export function useSquadAvailabilityPanel(input: AvailabilityPanelInput): AvailabilityPanelView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [value, setValue] = useState<AvailabilityValue>('available');
  const [reason, setReason] = useState('');

  const query = useSquadAvailabilityQuery(input.teamId, input.squadId);
  const declare = useDeclareAvailabilityMutation(input.teamId, input.squadId, {
    onSuccess: () => {
      setReason('');
      void toast.showToast({ message: t(I18N_KEYS.squads.availabilitySaved), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.squads.actionFailed), tone: 'danger' });
    },
  });

  return {
    heading: t(I18N_KEYS.squads.availabilityHeading),
    intro: t(I18N_KEYS.squads.availabilityIntro),
    windowNotice: input.isWindowClosed ? t(I18N_KEYS.squads.availabilityWindowClosed) : null,
    valueLabel: t(I18N_KEYS.squads.availabilityLabel),
    value,
    options: AVAILABILITY_VALUES.map((option) => ({
      value: option,
      label: t(AVAILABILITY_LABEL_KEYS[option]),
    })),
    reasonLabel: t(I18N_KEYS.squads.availabilityReasonLabel),
    reasonPlaceholder: t(I18N_KEYS.squads.availabilityReasonPlaceholder),
    reasonValue: reason,
    submitLabel: t(I18N_KEYS.squads.availabilitySubmit),
    isSaving: declare.isRunning,
    emptyLabel: t(I18N_KEYS.squads.availabilityEmpty),
    rows: buildAvailabilityRows(t, query.data?.items ?? []),
    onValueChange: (next: string) => {
      setValue(next as AvailabilityValue);
    },
    onReasonChange: setReason,
    onSubmit: () => {
      declare.run({ availability: value, reason: reason.trim() === '' ? null : reason.trim() });
    },
  };
}
