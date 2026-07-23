import { useState } from 'react';

import { cairoWallTimeToUtcIso } from '@/packages/date';

/** The chosen effective-from instant, shared by the form and weight rows. */
export interface EffectiveInstantState {
  readonly wallTime: string;
  readonly isOpen: boolean;
  /** Strict-UTC mirror of `wallTime`, or '' while nothing is chosen. */
  readonly utcIso: string;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
  readonly onChange: (value: string) => void;
}

/**
 * Owns the Cairo wall-time the admin picks. It lives above the form hook
 * because the weights editor derives its rows from the snapshot at this
 * same instant — one state, two honest consumers.
 */
export function useEffectiveInstant(): EffectiveInstantState {
  const [wallTime, setWallTime] = useState('');
  const [isOpen, setOpen] = useState(false);
  return {
    wallTime,
    isOpen,
    utcIso: wallTime === '' ? '' : cairoWallTimeToUtcIso(wallTime),
    onOpen: () => {
      setOpen(true);
    },
    onDismiss: () => {
      setOpen(false);
    },
    onChange: setWallTime,
  };
}
