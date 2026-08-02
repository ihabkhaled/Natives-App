import { I18N_KEYS } from '@/shared/i18n';

/**
 * The "what happens next" steps the public tryouts page reassures an
 * applicant with. Data-driven so one component renders all three instead of
 * three near-identical blocks.
 */
export const PUBLIC_STEP_KEYS = [
  {
    key: 'confirm',
    titleKey: I18N_KEYS.tryouts.publicStepOneTitle,
    bodyKey: I18N_KEYS.tryouts.publicStepOneBody,
  },
  {
    key: 'play',
    titleKey: I18N_KEYS.tryouts.publicStepTwoTitle,
    bodyKey: I18N_KEYS.tryouts.publicStepTwoBody,
  },
  {
    key: 'outcome',
    titleKey: I18N_KEYS.tryouts.publicStepThreeTitle,
    bodyKey: I18N_KEYS.tryouts.publicStepThreeBody,
  },
] as const;
