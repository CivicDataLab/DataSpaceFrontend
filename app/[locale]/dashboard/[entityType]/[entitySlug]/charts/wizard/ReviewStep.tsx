'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconPencil,
  IconSend,
} from '@tabler/icons-react';
import { Button, SectionCard, Text, TextField } from 'opub-ui';

export interface ReviewRow {
  label: string;
  value: string;
}

export interface ReadinessItem {
  label: string;
  ok: boolean;
}

export function ReviewStep({
  datasetTitle,
  resourceName,
  chartTypeLabel,
  configRows,
  chartName,
  onChartName,
  preview,
  checks,
  editBase,
  saving,
  publishing,
  onSave,
  onPublish,
  publishLabel = 'Publish Changes',
}: {
  datasetTitle: string;
  resourceName?: string | null;
  chartTypeLabel: string;
  configRows: ReviewRow[];
  chartName: string;
  onChartName: (name: string) => void;
  preview: ReactNode;
  checks: ReadinessItem[];
  editBase: string;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  publishLabel?: string;
}) {
  const router = useRouter();
  const ready = checks.every((check) => check.ok);

  const editAction = (label: string, hash: string) => [
    {
      icon: IconPencil,
      content: label,
      onAction: () => router.push(`${editBase}/build${hash}`),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-6">
      <div>
        <Text variant="headingLg" fontWeight="semibold">
          Review & Publish
        </Text>
        <div className="mt-1">
          <Text color="subdued">
            Check your information before making this content available publicly.
          </Text>
        </div>
      </div>

      <SectionCard
        title="Dataset & Source"
        expandable
        defaultExpanded
        actions={editAction('Edit dataset', '#data')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField label="Dataset" value={datasetTitle || '—'} />
          {resourceName ? <ReviewField label="File / Resource" value={resourceName} /> : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Chart Type & Configuration"
        expandable
        defaultExpanded
        actions={editAction('Edit configuration', '#configure')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField label="Chart type" value={chartTypeLabel} />
          {configRows.map((row) => (
            <ReviewField key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Chart Name">
        <TextField
          name="reviewChartName"
          label="Chart name"
          requiredIndicator
          helpText="Use a name that describes what this chart shows."
          value={chartName}
          onChange={onChartName}
        />
      </SectionCard>

      <SectionCard title="Live Preview">{preview}</SectionCard>

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4">
        <div className="pt-4">
          <Text fontWeight="semibold">
            {ready ? 'Ready to publish' : 'Needs attention'}
          </Text>
        </div>
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-3 border-b-1 border-solid border-borderSubdued py-3 last:border-b-0"
          >
            {check.ok ? (
              <IconCircleCheck size={18} className="shrink-0 text-textSuccess" />
            ) : (
              <IconAlertTriangle size={18} className="shrink-0 text-textCritical" />
            )}
            <Text>{check.label}</Text>
          </div>
        ))}
      </div>

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4 py-6 text-center">
        <Text color="subdued">
          Publishing will replace the current public version of this chart immediately.
        </Text>
        <div className="mt-4 flex justify-center">
          <Button
            kind="primary"
            loading={publishing}
            disabled={!ready || publishing}
            onClick={onPublish}
            icon={<IconSend size={16} />}
          >
            {publishLabel}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button kind="tertiary" onClick={() => router.push(`${editBase}/build`)}>
          Previous
        </Button>
        <Button kind="secondary" loading={saving} onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="bodySm" color="subdued">
        {label.toUpperCase()}
      </Text>
      <Text variant="bodyMd" fontWeight="medium">
        {value || '—'}
      </Text>
    </div>
  );
}
