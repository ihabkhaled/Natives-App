import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import { buildConversionFacts, isConvertible } from '../helpers/decision-view.helper';
import { useConvertCandidateMutation } from '../mutations/use-convert-candidate-mutation.hook';
import type { CandidatePanelInput } from '../types/mutation.types';
import type { ConversionPanelView } from '../types/tryouts-view.types';

/**
 * Member conversion. The preview states whether an account already exists,
 * the action confirms first, and a second conversion is a no-op the backend
 * reports as `alreadyConverted`.
 */
export function useCandidateConversion(input: CandidatePanelInput): ConversionPanelView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const alert = useConfirmAlert();
  const convert = useConvertCandidateMutation(input.teamId, input.tryoutId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.conversionDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.actionFailed), tone: 'danger' });
    },
  });

  const alreadyConverted = (input.detail?.convertedMembershipId ?? null) !== null;
  const blockedNotice = (): string | null => {
    if (alreadyConverted) {
      return t(I18N_KEYS.tryouts.conversionAlready);
    }
    return isConvertible(input.detail) ? null : t(I18N_KEYS.tryouts.conversionBlocked);
  };

  return {
    heading: t(I18N_KEYS.tryouts.conversionHeading),
    intro: t(I18N_KEYS.tryouts.conversionIntro),
    previewHeading: t(I18N_KEYS.tryouts.conversionPreviewHeading),
    previewFacts: buildConversionFacts(t, input.detail),
    accountNotice:
      input.detail?.existingAccount === true
        ? t(I18N_KEYS.tryouts.conversionExistingAccount)
        : t(I18N_KEYS.tryouts.conversionNewAccount),
    confirmLabel: t(I18N_KEYS.tryouts.conversionConfirm),
    isSaving: convert.isRunning,
    blockedNotice: blockedNotice(),
    forbiddenNotice: input.isPermitted ? null : t(I18N_KEYS.tryouts.conversionForbidden),
    onConfirm: () => {
      void alert
        .confirm({
          header: t(I18N_KEYS.tryouts.conversionConfirmTitle),
          message: t(I18N_KEYS.tryouts.conversionConfirmMessage),
          cancelLabel: t(I18N_KEYS.tryouts.conversionCancel),
          confirmLabel: t(I18N_KEYS.tryouts.conversionConfirm),
        })
        .then((confirmed) => {
          const candidateId = input.detail?.summary.candidateId ?? null;
          if (confirmed && candidateId !== null) {
            convert.run(candidateId);
          }
        });
    },
  };
}
