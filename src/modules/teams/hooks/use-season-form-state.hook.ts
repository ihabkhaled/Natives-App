import { useState } from 'react';

import { SEASON_STATUS, type SeasonStatus } from '../constants/teams.constants';
import { toSeasonFormValues } from '../helpers/editor-seed.helper';
import type { Season } from '../types/teams.types';

export interface SeasonFormState {
  readonly isOpen: boolean;
  readonly editing: Season | null;
  readonly isSubmitted: boolean;
  readonly slug: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: SeasonStatus;
  readonly openDatePicker: 'startsOn' | 'endsOn' | null;
  readonly setSlug: (value: string) => void;
  readonly setName: (value: string) => void;
  readonly setStartsOn: (value: string) => void;
  readonly setEndsOn: (value: string) => void;
  readonly setStatus: (value: SeasonStatus) => void;
  readonly setOpenDatePicker: (value: 'startsOn' | 'endsOn' | null) => void;
  readonly openCreate: () => void;
  readonly openEdit: (season: Season) => void;
  readonly close: () => void;
  readonly markSubmitted: () => void;
}

/**
 * The season editor's raw field state. Only one date picker may be open at a
 * time so the two calendars never stack on top of each other.
 */
export function useSeasonFormState(): SeasonFormState {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [status, setStatus] = useState<SeasonStatus>(SEASON_STATUS.draft);
  const [openDatePicker, setOpenDatePicker] = useState<'startsOn' | 'endsOn' | null>(null);
  const seed = (season: Season | null): void => {
    const values = toSeasonFormValues(season);
    setEditing(season);
    setSlug(values.slug);
    setName(values.name);
    setStartsOn(values.startsOn);
    setEndsOn(values.endsOn);
    setStatus(values.status);
    setOpenDatePicker(null);
    setIsSubmitted(false);
    setIsOpen(true);
  };
  return {
    isOpen,
    editing,
    isSubmitted,
    slug,
    name,
    startsOn,
    endsOn,
    status,
    openDatePicker,
    setSlug,
    setName,
    setStartsOn,
    setEndsOn,
    setStatus,
    setOpenDatePicker,
    openCreate: () => {
      seed(null);
    },
    openEdit: seed,
    close: () => {
      setIsOpen(false);
      setEditing(null);
      setOpenDatePicker(null);
      setIsSubmitted(false);
    },
    markSubmitted: () => {
      setIsSubmitted(true);
    },
  };
}
