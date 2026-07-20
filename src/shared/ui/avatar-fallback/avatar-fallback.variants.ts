import { cva } from '@/packages/ui-classes';

/**
 * Placeholder avatar on the cool slate tonal surface with its contrast ink — a
 * 9.4:1 pair in both themes. Gold is reserved for achievements, so identity
 * avatars stay neutral; the lime hairline keeps them on-brand. The identity is
 * conveyed by the initials or icon and the accessible label, never by colour.
 */
export const avatarFallbackVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--un-radius-circle)] bg-[var(--ion-color-secondary)] font-semibold text-[var(--ion-color-secondary-contrast)] ring-1 ring-[var(--app-lime-line)]',
  {
    variants: {
      size: {
        sm: 'size-8 text-(--un-font-size-xs)',
        md: 'size-11 text-(--un-font-size-sm)',
        lg: 'size-16 text-(--un-font-size-lg)',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);
