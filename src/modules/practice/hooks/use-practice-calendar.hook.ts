import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { useNetworkStatus } from '@/platform';

import {
  PRACTICE_MAX_PAGE_SIZE,
  PRACTICE_PAGE_SIZE,
  PRACTICE_SCOPE,
  type PracticeScope,
  type PracticeType,
  type RsvpStatus,
} from '../constants/practice.constants';
import { buildPracticeCalendarView } from '../helpers/practice-calendar-view.helper';
import { practiceSessionPath } from '../routes/practice.paths';
import { usePracticeSessionsQuery } from './use-practice-sessions-query.hook';
import type { PracticeCalendarView } from '../types/practice-view.types';

/** Prepared, translated, offline- and permission-aware practice calendar. */
export function usePracticeCalendar(): PracticeCalendarView {
  const { t, locale } = useAppTranslation();
  const navigation = useAppNavigation();
  const network = useNetworkStatus();
  const [scope, setScope] = useState<PracticeScope>(PRACTICE_SCOPE.upcoming);
  const [type, setType] = useState<PracticeType | null>(null);
  const [rsvp, setRsvp] = useState<RsvpStatus | null>(null);
  const [pageSize, setPageSize] = useState<number>(PRACTICE_PAGE_SIZE);
  const query = usePracticeSessionsQuery({ scope, type, rsvp, pageSize });

  function onFilterChange<T>(setter: (value: T) => void): (value: T) => void {
    return (value) => {
      setter(value);
      setPageSize(PRACTICE_PAGE_SIZE);
    };
  }

  return buildPracticeCalendarView({
    t,
    locale,
    page: query.page,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    isOffline: !network.isOnline,
    scope,
    type,
    rsvp,
    pageSize,
    onScopeChange: onFilterChange(setScope),
    onTypeChange: onFilterChange(setType),
    onRsvpChange: onFilterChange(setRsvp),
    onRetry: query.refetch,
    onLoadMore: () => {
      setPageSize((size) => Math.min(size + PRACTICE_PAGE_SIZE, PRACTICE_MAX_PAGE_SIZE));
    },
    onSelectSession: (sessionId) => {
      navigation.push(practiceSessionPath(sessionId));
    },
  });
}
