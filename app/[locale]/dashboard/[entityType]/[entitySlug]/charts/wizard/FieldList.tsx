'use client';

import { useState } from 'react';
import {
  IconCalendar,
  IconGripVertical,
  IconHash,
  IconTypography,
} from '@tabler/icons-react';
import { Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import {
  columnKind,
  columnKindLabel,
  type ColumnKind,
  type SchemaField,
} from './model';

export const CHART_FIELD_DRAG_TYPE = 'application/x-chart-field';

const KIND_ICON = {
  numeric: IconHash,
  date: IconCalendar,
  text: IconTypography,
} as const;

export function FieldList({
  fields,
  roleFor,
  onDragField,
}: {
  fields: SchemaField[];
  roleFor: (id: string) => string | null;
  onDragField: (field: SchemaField | null) => void;
}) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const matched = normalized
    ? fields.filter((field) =>
        field.fieldName.toLowerCase().includes(normalized)
      )
    : fields;
  const visible = [...matched].sort((left, right) => {
    const leftSelected = roleFor(left.id) ? 0 : 1;
    const rightSelected = roleFor(right.id) ? 0 : 1;
    return leftSelected - rightSelected;
  });

  return (
    <div className="relative h-96 min-h-96 lg:h-auto">
      <div className="absolute inset-0 flex flex-col overflow-hidden rounded-3 border-1 border-solid border-borderSubdued">
        <div className="bg-surfaceNeutral flex flex-col gap-2 border-b-1 border-solid border-borderSubdued p-3">
        <div className="flex items-baseline justify-between gap-2">
          <Text fontWeight="semibold">Fields</Text>
          <Text variant="bodySm" color="subdued">
            {normalized
              ? `${visible.length} of ${fields.length}`
              : fields.length}
          </Text>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fields…"
          aria-label="Search fields"
          className="text-bodyMd w-full rounded-2 border-1 border-solid border-borderSubdued bg-surfaceDefault px-3 py-2 outline-none"
        />
        <Text variant="bodySm" color="subdued">
          Drag a field into a box on the right, or pick it from the list.
        </Text>
      </div>
      <ul
        className="min-h-0 flex-1 overflow-y-auto p-1.5"
        aria-label="Fields in this file"
      >
        {visible.length === 0 ? (
          <li className="px-3 py-6 text-center">
            <Text color="subdued">No fields match your search.</Text>
          </li>
        ) : (
          visible.map((field) => {
            const kind: ColumnKind = columnKind(field.format);
            const Icon = KIND_ICON[kind];
            const role = roleFor(field.id);
            return (
              <li
                key={field.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(CHART_FIELD_DRAG_TYPE, field.id);
                  event.dataTransfer.effectAllowed = 'copy';
                  onDragField(field);
                }}
                onDragEnd={() => onDragField(null)}
                className={cn(
                  'hover:bg-surfaceNeutral group flex cursor-grab items-center gap-3 rounded-2 px-2.5 py-2 active:cursor-grabbing',
                  role && 'bg-surfaceSelected'
                )}
              >
                <Icon
                  size={16}
                  className="shrink-0 text-textSubdued"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Text className="truncate" title={field.fieldName}>
                    {field.fieldName}
                  </Text>
                  <Text variant="bodySm" color="subdued">
                    {columnKindLabel(kind)}
                  </Text>
                </div>
                {role ? (
                  <span className="text-bodySm shrink-0 rounded-full bg-surfaceHighlightSubdued px-2 py-0.5 text-textHighlight">
                    {role}
                  </span>
                ) : null}
                <IconGripVertical
                  size={16}
                  className="shrink-0 text-textSubdued"
                  aria-hidden
                />
              </li>
            );
          })
        )}
      </ul>
      </div>
    </div>
  );
}
