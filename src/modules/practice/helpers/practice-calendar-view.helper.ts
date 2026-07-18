import type { TranslateParams } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import { type AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { PRACTICE_MAX_PAGE_SIZE } from '../constants/practice.constants';
import type { PracticeScope, PracticeType, RsvpStatus } from '../constants/practice.constants';
import {
  groupSessionsByDay,
  resolvePracticeCalendarStatus,
} from './practice-calendar-view-model.helper';
import { buildPracticeFilterOptions } from './practice-filter-options.helper';
import type { PracticeCalendarView, PracticeFilterView } from '../types/practice-view.types';
import type { PracticeSessionListPage } from '../types/practice.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface BuildPracticeCalendarViewParams {
  readonly t: Translate;
  readonly locale: string;
  readonly page: PracticeSessionListPage | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly scope: PracticeScope;
  readonly type: PracticeType | null;
  readonly rsvp: RsvpStatus | null;
  readonly pageSize: number;
  readonly onScopeChange: (scope: PracticeScope) => void;
  readonly onTypeChange: (type: PracticeType | null) => void;
  readonly onRsvpChange: (rsvp: RsvpStatus | null) => void;
  readonly onRetry: () => void;
  readonly onLoadMore: () => void;
  readonly onSelectSession: (sessionId: string) => void;
}

function buildFilterView(params: BuildPracticeCalendarViewParams): PracticeFilterView {
  const { t } = params;
  const options = buildPracticeFilterOptions(t);
  return {
    scopeLabel: t(I18N_KEYS.practice.filterScopeLabel),
    scope: params.scope,
    scopeOptions: options.scope,
    onScopeChange: params.onScopeChange,
    typeLabel: t(I18N_KEYS.practice.filterTypeLabel),
    typeAllLabel: t(I18N_KEYS.practice.filterTypeAll),
    type: params.type,
    typeOptions: options.type,
    onTypeChange: params.onTypeChange,
    rsvpLabel: t(I18N_KEYS.practice.filterRsvpLabel),
    rsvpAllLabel: t(I18N_KEYS.practice.filterRsvpAll),
    rsvp: params.rsvp,
    rsvpOptions: options.rsvp,
    onRsvpChange: params.onRsvpChange,
  };
}

interface PaginationView {
  readonly hasMore: boolean;
  readonly isFetchingMore: boolean;
  readonly boundedNotice: string | null;
}

function buildPaginationView(params: BuildPracticeCalendarViewParams): PaginationView {
  const hasMore = params.page?.hasMore ?? false;
  const reachedMax = params.pageSize >= PRACTICE_MAX_PAGE_SIZE;
  return {
    hasMore: hasMore && !reachedMax,
    isFetchingMore: params.isFetching && params.page !== undefined && !params.isLoading,
    boundedNotice:
      hasMore && reachedMax
        ? params.t(I18N_KEYS.practice.boundedNotice, { count: params.pageSize })
        : null,
  };
}

function resolveErrorMessage(t: Translate, error: AppError | null): string {
  return error === null ? '' : t(mapErrorCodeToI18nKey(error.code));
}

/** Assemble the full translated calendar view from query + filter state. */
export function buildPracticeCalendarView(
  params: BuildPracticeCalendarViewParams,
): PracticeCalendarView {
  const { t, locale, page, error } = params;
  const isForbidden = error !== null && error.code === APP_ERROR_CODE.Forbidden;
  const hasSessions = page !== undefined && page.items.length > 0;
  return {
    title: t(I18N_KEYS.practice.calendarTitle),
    subtitle: t(I18N_KEYS.practice.calendarSubtitle),
    status: resolvePracticeCalendarStatus({
      hasSessions,
      hasData: page !== undefined,
      isLoading: params.isLoading,
      isForbidden,
      hasError: error !== null,
      isOffline: params.isOffline,
    }),
    loadingLabel: t(I18N_KEYS.common.loading),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    errorMessage: resolveErrorMessage(t, error),
    retryLabel: t(I18N_KEYS.common.retry),
    onRetry: params.onRetry,
    offlineTitle: t(I18N_KEYS.states.offlineTitle),
    offlineMessage: t(I18N_KEYS.states.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.practice.offlineNotice),
    isOffline: params.isOffline,
    emptyTitle: t(I18N_KEYS.practice.emptyTitle),
    emptyMessage: t(I18N_KEYS.practice.emptyMessage),
    forbiddenTitle: t(I18N_KEYS.states.permissionTitle),
    forbiddenMessage: t(I18N_KEYS.states.permissionMessage),
    filter: buildFilterView(params),
    sections: page === undefined ? [] : groupSessionsByDay(t, locale, page.items),
    onSelectSession: params.onSelectSession,
    loadMoreLabel: t(I18N_KEYS.practice.loadMore),
    onLoadMore: params.onLoadMore,
    subscriptionHeading: t(I18N_KEYS.practice.subscriptionHeading),
    subscriptionBody: t(I18N_KEYS.practice.subscriptionBody),
    ...buildPaginationView(params),
  };
}
