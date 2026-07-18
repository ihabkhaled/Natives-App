import { cva } from '@/packages/ui-classes';

/**
 * Placeholder avatar on the brand gold with black content — an 8.7:1 pair that
 * stays legible. The identity is conveyed by the initials or icon and the
 * accessible label, never by colour alone.
 */
export const avatarFallbackVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--un-radius-circle)] bg-[var(--un-brand-gold)] font-semibold text-[var(--un-on-brand-gold)]',
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
