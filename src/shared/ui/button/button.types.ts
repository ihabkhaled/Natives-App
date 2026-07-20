/**
 * The action weights of the design system:
 * - `primary`   electric turf lime with near-black ink — one per view.
 * - `secondary` cool slate tonal — supporting actions, never a dead grey.
 * - `ghost`     text-only tertiary action.
 * - `danger`    destructive confirmation.
 */
export type AppButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps {
  readonly label: string;
  readonly onClick?: (() => void) | undefined;
  readonly type?: 'button' | 'submit';
  readonly tone?: AppButtonTone;
  readonly disabled?: boolean | undefined;
  readonly loading?: boolean | undefined;
  readonly expand?: boolean | undefined;
  readonly testId?: string | undefined;
}
