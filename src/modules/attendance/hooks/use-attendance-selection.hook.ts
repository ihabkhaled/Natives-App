import { useState } from 'react';

export interface AttendanceSelectionView {
  readonly selectedIds: readonly string[];
  readonly toggleMember: (membershipId: string) => void;
  readonly selectMembers: (membershipIds: readonly string[]) => void;
  readonly clearSelection: () => void;
}

export function useAttendanceSelection(): AttendanceSelectionView {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  return {
    selectedIds,
    toggleMember: (membershipId) => {
      setSelectedIds((current) =>
        current.includes(membershipId)
          ? current.filter((id) => id !== membershipId)
          : [...current, membershipId],
      );
    },
    selectMembers: setSelectedIds,
    clearSelection: () => {
      setSelectedIds([]);
    },
  };
}
