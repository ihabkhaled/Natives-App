import { useState } from 'react';

import { toTeamFormValues } from '../helpers/editor-seed.helper';
import type { Team } from '../types/teams.types';

export interface TeamFormState {
  readonly isOpen: boolean;
  /** The team being edited, or null while creating a new one. */
  readonly editing: Team | null;
  readonly isSubmitted: boolean;
  readonly slug: string;
  readonly name: string;
  readonly timezone: string;
  readonly locale: string;
  readonly color: string;
  readonly setSlug: (value: string) => void;
  readonly setName: (value: string) => void;
  readonly setTimezone: (value: string) => void;
  readonly setLocale: (value: string) => void;
  readonly setColor: (value: string) => void;
  readonly openCreate: () => void;
  readonly openEdit: (team: Team) => void;
  readonly close: () => void;
  readonly markSubmitted: () => void;
}

/** The team editor's raw field state, seeded from whichever team is being edited. */
export function useTeamFormState(): TeamFormState {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [locale, setLocale] = useState('');
  const [color, setColor] = useState('');
  const seed = (team: Team | null): void => {
    const values = toTeamFormValues(team);
    setEditing(team);
    setSlug(values.slug);
    setName(values.name);
    setTimezone(values.timezone);
    setLocale(values.locale);
    setColor(values.color);
    setIsSubmitted(false);
    setIsOpen(true);
  };
  return {
    isOpen,
    editing,
    isSubmitted,
    slug,
    name,
    timezone,
    locale,
    color,
    setSlug,
    setName,
    setTimezone,
    setLocale,
    setColor,
    openCreate: () => {
      seed(null);
    },
    openEdit: seed,
    close: () => {
      setIsOpen(false);
      setEditing(null);
      setIsSubmitted(false);
    },
    markSubmitted: () => {
      setIsSubmitted(true);
    },
  };
}
