import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Season, Team } from '../types/teams.types';
import { buildSeason, buildTeam } from '../../../../tests/factories/teams.factory';
import { useSeasonFormState } from './use-season-form-state.hook';
import { useTeamFormState } from './use-team-form-state.hook';

const TEAM: Team = buildTeam();
const SEASON: Season = buildSeason({ status: 'active', version: 2 });

describe('useTeamFormState', () => {
  it('starts closed with nothing being edited', () => {
    const { result } = renderHook(() => useTeamFormState());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editing).toBeNull();
  });

  it('opens blank for a create', () => {
    const { result } = renderHook(() => useTeamFormState());

    act(() => {
      result.current.openCreate();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editing).toBeNull();
    expect(result.current.slug).toBe('');
  });

  it('opens seeded from the team being edited', () => {
    const { result } = renderHook(() => useTeamFormState());

    act(() => {
      result.current.openEdit(TEAM);
    });

    expect(result.current.editing).toBe(TEAM);
    expect(result.current).toMatchObject({
      slug: 'un',
      name: 'Ultimate Natives',
      timezone: 'Africa/Cairo',
      locale: 'en',
      color: '#000000',
    });
  });

  it('records every field edit', () => {
    const { result } = renderHook(() => useTeamFormState());

    act(() => {
      result.current.setSlug('new');
      result.current.setName('New');
      result.current.setTimezone('UTC');
      result.current.setLocale('ar');
      result.current.setColor('#fff');
    });

    expect(result.current).toMatchObject({
      slug: 'new',
      name: 'New',
      timezone: 'UTC',
      locale: 'ar',
      color: '#fff',
    });
  });

  it('shows validation only after a submit attempt, and forgets it on close', () => {
    const { result } = renderHook(() => useTeamFormState());

    act(() => {
      result.current.openCreate();
    });
    expect(result.current.isSubmitted).toBe(false);

    act(() => {
      result.current.markSubmitted();
    });
    expect(result.current.isSubmitted).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editing).toBeNull();
  });
});

describe('useSeasonFormState', () => {
  it('opens a create as a draft with an empty window', () => {
    const { result } = renderHook(() => useSeasonFormState());

    act(() => {
      result.current.openCreate();
    });

    expect(result.current).toMatchObject({
      isOpen: true,
      status: 'draft',
      startsOn: '',
      endsOn: '',
    });
  });

  it('opens seeded from the season being edited', () => {
    const { result } = renderHook(() => useSeasonFormState());

    act(() => {
      result.current.openEdit(SEASON);
    });

    expect(result.current).toMatchObject({
      slug: '2026',
      name: 'Season 2026',
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active',
    });
  });

  it('records every field edit', () => {
    const { result } = renderHook(() => useSeasonFormState());

    act(() => {
      result.current.setSlug('2027');
      result.current.setName('Season 2027');
      result.current.setStartsOn('2027-01-01');
      result.current.setEndsOn('2027-12-31');
      result.current.setStatus('closed');
    });

    expect(result.current).toMatchObject({
      slug: '2027',
      name: 'Season 2027',
      startsOn: '2027-01-01',
      endsOn: '2027-12-31',
      status: 'closed',
    });
  });

  it('lets only one calendar be open at a time and closes it on dismiss', () => {
    const { result } = renderHook(() => useSeasonFormState());

    act(() => {
      result.current.setOpenDatePicker('startsOn');
    });
    expect(result.current.openDatePicker).toBe('startsOn');

    act(() => {
      result.current.setOpenDatePicker('endsOn');
    });
    expect(result.current.openDatePicker).toBe('endsOn');

    act(() => {
      result.current.close();
    });
    expect(result.current.openDatePicker).toBeNull();
  });

  it('marks a submit attempt', () => {
    const { result } = renderHook(() => useSeasonFormState());

    act(() => {
      result.current.markSubmitted();
    });

    expect(result.current.isSubmitted).toBe(true);
  });
});
