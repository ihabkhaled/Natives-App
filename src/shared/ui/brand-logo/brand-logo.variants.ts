import { cva } from '@/packages/ui-classes';

/**
 * The logo sits on the brand-black safe area (`--un-logo-safe-bg`) so the black
 * outline of the supplied art never merges into a light surface, and rounded
 * corners keep it on-brand at every size.
 */
export const brandLogoFrameVariants = cva(
  'inline-flex items-center justify-center overflow-hidden bg-[var(--un-logo-safe-bg)]',
  {
    variants: {
      size: {
        sm: 'size-10 rounded-[var(--un-radius-md)] p-1',
        md: 'size-16 rounded-[var(--un-radius-lg)] p-1.5',
        lg: 'size-28 rounded-[var(--un-radius-xl)] p-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);
