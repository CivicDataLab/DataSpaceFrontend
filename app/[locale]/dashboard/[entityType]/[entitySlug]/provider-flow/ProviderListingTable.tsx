'use client';

import { IconEyeOff, IconPencil, IconTrash } from '@tabler/icons-react';
import {
  Badge,
  DataTable,
  Icon,
  Text,
  type ColumnFilterConfig,
  type DataTableProps,
  type DataTableRowAction,
  type IconProps,
} from 'opub-ui';

import styles from '../dataset/listing.module.scss';
import { TABLE_PAGE_SIZE, useProviderTable } from './table-listing';

type ListingTableState = ReturnType<typeof useProviderTable>;

type ProviderListingTableProps = {
  title: string;
  subtitle: string;
  addLabel: string;
  onAdd: () => void;
  placeholder: string;
  columns: DataTableProps['columns'];
  rows: DataTableProps['rows'];
  sortColumns: string[];
  filters: ColumnFilterConfig[];
  statuses: Array<{ key: string; label: string }>;
  emptyLabel: string;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  totalRows: number;
  statusCounts?: Record<string, number>;
  table: ListingTableState;
  tourId?: string;
  getRowActions: NonNullable<DataTableProps['getRowActions']>;
};

export function ProviderListingTable({
  title,
  subtitle,
  addLabel,
  onAdd,
  placeholder,
  columns,
  rows,
  sortColumns,
  filters,
  statuses,
  emptyLabel,
  loading,
  loadError,
  onRetry,
  totalRows,
  statusCounts,
  table,
  tourId,
  getRowActions,
}: ProviderListingTableProps) {
  return (
    <div className={`flex h-full flex-col md:mt-5 lg:mt-2 ${styles.listing}`}>
      <DataTable
        columnContentTypes={columns.map(() => 'text' as const)}
        columns={columns}
        rows={rows}
        hideSelection
        style={{ borderRadius: '20px' }}
        withServer
        title={title}
        subtitle={subtitle}
        addLabel={addLabel}
        onAdd={onAdd}
        placeholder={placeholder}
        sortColumns={sortColumns}
        filters={filters}
        statuses={statuses}
        defaultRowCount={TABLE_PAGE_SIZE}
        labels={{ empty: emptyLabel }}
        loading={loading}
        loadError={loadError}
        onRetry={onRetry}
        totalRows={totalRows}
        statusCounts={statusCounts}
        searchState={table.search}
        onSearchChange={table.setSearch}
        statusState={table.status}
        onStatusChange={table.selectStatus}
        filterState={table.filters}
        sortingState={table.sorting}
        paginationState={table.pagination}
        onFiltersChange={table.onFiltersChange}
        onSortingChange={table.setSorting}
        onPaginationChange={table.setPagination}
        getRowActions={getRowActions}
        {...(tourId ? { 'data-tour': tourId } : {})}
      />
    </div>
  );
}

export function ListingTitle({
  icon,
  label,
}: {
  icon: IconProps['source'];
  label: string;
}) {
  return (
    <span className="flex w-full min-w-0 items-center gap-2">
      <span className="inline-flex shrink-0">
        <Icon source={icon} color="subdued" size={18} />
      </span>
      <Text className="min-w-0 truncate" title={label}>
        {label}
      </Text>
    </span>
  );
}

export function ListingStatus({
  published,
  label,
}: {
  published: boolean;
  label: string;
}) {
  return <Badge status={published ? 'success' : 'warning'}>{label}</Badge>;
}

export function listingRowActions({
  published,
  title,
  noun,
  onEdit,
  onUnpublish,
  onDelete,
}: {
  published: boolean;
  title: string;
  noun: string;
  onEdit: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}): DataTableRowAction[] {
  const actions: DataTableRowAction[] = [];

  if (published) {
    actions.push({
      key: 'unpublish',
      icon: IconEyeOff,
      color: 'critical',
      label: 'Unpublish',
      onClick: onUnpublish,
      alert: {
        title: `Unpublish ${noun}?`,
        children: `Unpublishing "${title}" will move it back to draft.`,
      },
    });
  } else {
    actions.push({
      key: 'edit',
      icon: IconPencil,
      label: `Edit ${title}`,
      onClick: onEdit,
    });
  }

  actions.push({
    key: 'delete',
    icon: IconTrash,
    label: 'Delete',
    destructive: true,
    onClick: onDelete,
    alert: {
      title: `Delete ${noun}?`,
      children: `Deleting "${title}" will permanently remove it. This action cannot be undone.`,
    },
  });

  return actions;
}
