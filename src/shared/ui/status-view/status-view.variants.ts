import { cva } from '@/packages/ui-classes';

export const statusIconVariants = cva('mb-2 text-5xl', {
  variants: {
    tone: {
      neutral: 'text-(--ion-color-medium)',
      danger: 'text-(--ion-color-danger)',
      warning: 'text-(--ion-color-warning)',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});
