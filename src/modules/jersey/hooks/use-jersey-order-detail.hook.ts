import { useState } from 'react';

import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView } from '@/shared/view';

import { jerseyQueryKeys } from '../queries/jersey.keys';
import { exportJerseyOrder } from '../services/export-jersey-order.service';
import { getJerseyOrder } from '../services/get-jersey-order.service';
import type { JerseyOrder, SupplierExport, SupplierExportLine } from '../types/jersey.types';

/** The scope one order is opened within. */
export interface JerseyOrderDetailInput {
  readonly teamId: string;
  /** Without it, nothing is requested: the packing list carries member names. */
  readonly canManage: boolean;
}

export interface JerseyOrderDetailApi {
  readonly openOrderId: string;
  readonly order: JerseyOrder | undefined;
  readonly lines: readonly SupplierExportLine[];
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly toggle: (orderId: string) => void;
}

/**
 * The one order an operator has opened.
 *
 * Nothing is read until they open it. Fetching every order's packing list
 * alongside the list would pull members' printed names and numbers across the
 * wire for orders nobody asked about — so the request is scoped to the single
 * order in front of them, and closing it stops asking.
 *
 * Two reads, not one: the order's own record is re-read so a stale row cannot
 * mislead, and the export supplies the lines. They stay on separate cache
 * branches so refreshing the record never quietly re-fetches the personal data.
 */
export function useJerseyOrderDetail(input: JerseyOrderDetailInput): JerseyOrderDetailApi {
  const [openOrderId, setOpenOrderId] = useState('');
  const teamId = input.teamId;
  const isOpen = openOrderId !== '' && input.canManage;

  const order = toRemoteQueryView<JerseyOrder>(
    useAppQuery({
      queryKey: jerseyQueryKeys.order(teamId, openOrderId),
      queryFn: (): Promise<JerseyOrder> => getJerseyOrder({ teamId, orderId: openOrderId }),
      enabled: isOpen,
    }),
  );
  const packingList = toRemoteQueryView<SupplierExport>(
    useAppQuery({
      queryKey: jerseyQueryKeys.supplierExport(teamId, openOrderId),
      queryFn: (): Promise<SupplierExport> => exportJerseyOrder({ teamId, orderId: openOrderId }),
      enabled: isOpen,
    }),
  );

  return {
    openOrderId: isOpen ? openOrderId : '',
    order: order.data,
    lines: packingList.data?.lines ?? [],
    isLoading: order.data === undefined || packingList.data === undefined,
    hasError: order.error !== null || packingList.error !== null,
    toggle: (orderId: string): void => {
      // Re-opening the same row closes it, so an operator can put the names
      // back out of sight without leaving the screen.
      setOpenOrderId((current) => (current === orderId ? '' : orderId));
    },
  };
}
