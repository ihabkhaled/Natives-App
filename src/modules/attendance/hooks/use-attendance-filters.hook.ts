import { useState } from 'react';

import type { AttendanceStatus } from '../constants/attendance.constants';

export interface AttendanceFiltersView {
  readonly searchValue: string;
  readonly filterValue: AttendanceStatus | null;
  readonly setSearchValue: (value: string) => void;
  readonly setFilterValue: (value: AttendanceStatus | null) => void;
}

export function useAttendanceFilters(): AttendanceFiltersView {
  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState<AttendanceStatus | null>(null);
  return { searchValue, filterValue, setSearchValue, setFilterValue };
}
