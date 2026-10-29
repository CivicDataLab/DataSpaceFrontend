'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconSend,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, SectionCard, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  entityHeaders,
  errorText,
  eventsBasePath,
  EventStatus,
  eventWriteInput,
  formatEventDate,
  isEventComplete,
  mutationMessage,
  parseLumaEmbed,
  type LumaEmbed,
} from '../../../model';
import {
  eventEditorQuery,
  publishEventMutation,
  updateEventMutation,
} from '../../../queries';
import { useEventEditStatus } from '../../../wizard/context';
import { eventToDraft } from '../../../wizard/EventEditFrame';

export default function EventPreviewPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const queryClient = useQueryClient();
  const editBase = `${eventsBasePath(params.entityType, params.entitySlug)}/edit/${params.id}`;
  const {
    setStatus,
    setTitleOverride,
    registerTitleSave,
    registerBeforeNavigateHandler,
  } = useEventEditStatus();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const editorQuery = useQuery(
    ['event_editor', params.id],
    () => GraphQL(eventEditorQuery, headers, { eventId: params.id }),
    { enabled: Boolean(params.id) }
  );

  const event = editorQuery.data?.event;
  const draft = event ? eventToDraft(event) : null;
  const embed = draft ? parseLumaEmbed(draft.lumaEmbed) : null;
  const ready = draft ? isEventComplete(draft) : false;
  const published = event?.status === EventStatus.Published;

  const save = async (next: NonNullable<typeof draft>, leave: boolean) => {
    setSaving(true);
    setStatus('loading');
    try {
      const result = await GraphQL(updateEventMutation, headers, {
        input: { id: params.id, ...eventWriteInput(next) },
      });
      const message = mutationMessage(
        result.updateEvent,
        'Could not save the event.'
      );
      if (message) throw new Error(message);
      await queryClient.invalidateQueries({
        queryKey: ['event_editor', params.id],
      });
      if (leave) {
        toast('Draft saved');
        router.push(eventsBasePath(params.entityType, params.entitySlug));
      }
    } catch (error) {
      toast(errorText(error, 'Could not save the event.'));
    } finally {
      setSaving(false);
      setStatus('success');
    }
  };

  useEffect(() => {
    registerTitleSave((title) => {
      if (!draft) return;
      setTitleOverride(title);
      void save({ ...draft, name: title }, false);
    });
    registerBeforeNavigateHandler(async () => undefined);
    return () => registerBeforeNavigateHandler(null);
  });

  const publish = async () => {
    if (!ready) return;
    setPublishing(true);
    setStatus('loading');
    try {
      const result = await GraphQL(publishEventMutation, headers, {
        eventId: params.id,
      });
      const message = mutationMessage(
        result.publishEvent,
        'Could not publish the event.'
      );
      if (message) throw new Error(message);
      await queryClient.invalidateQueries({
        queryKey: ['event_editor', params.id],
      });
      toast('Event published');
    } catch (error) {
      toast(errorText(error, 'Could not publish the event.'));
    } finally {
      setPublishing(false);
      setStatus('success');
    }
  };

  if (editorQuery.isLoading && !event) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (editorQuery.isError || !draft) {
    return <div>Could not load this event.</div>;
  }

  const checks = [
    { label: 'Name', ok: Boolean(draft.name.trim()) },
    { label: 'Location', ok: Boolean(draft.location.trim()) },
    { label: 'Start date', ok: Boolean(draft.startDate) },
    {
      label: 'End date',
      ok: Boolean(draft.endDate && draft.endDate >= draft.startDate),
    },
    { label: 'Luma embed', ok: Boolean(embed?.src) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="headingLg" fontWeight="semibold">
          Review & Publish
        </Text>
        <div className="mt-1">
          <Text color="subdued">
            Check your information before making this content available
            publicly.
          </Text>
        </div>
      </div>

      <SectionCard title="Event">
        <div className="flex flex-col gap-5">
          <PreviewField label="Name" value={draft.name} />
          <PreviewField label="Location" value={draft.location} />
          <PreviewField
            label="Start date"
            value={formatEventDate(draft.startDate)}
          />
          <PreviewField
            label="End date"
            value={formatEventDate(draft.endDate)}
          />
          <PreviewField label="Public link" value={event?.urlSlug || '—'} />
        </div>
      </SectionCard>

      <SectionCard title="Luma embed">
        {embed ? (
          <LumaEmbedFrame embed={embed} title={draft.name} />
        ) : (
          <Text color="subdued">Add a Luma embed on the details step.</Text>
        )}
      </SectionCard>

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
              <IconCircleCheck
                size={18}
                className="shrink-0 text-textSuccess"
              />
            ) : (
              <IconAlertTriangle
                size={18}
                className="shrink-0 text-textCritical"
              />
            )}
            <Text>{check.label}</Text>
          </div>
        ))}
      </div>

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4 py-6 text-center">
        <Text color="subdued">
          {published
            ? 'This event is published and available publicly.'
            : 'This event is not yet published. Publish it to make it available publicly.'}
        </Text>
        <div className="mt-4 flex justify-center">
          <Button
            kind="primary"
            loading={publishing}
            disabled={!ready || publishing || published}
            onClick={() => void publish()}
            icon={<IconSend size={16} />}
          >
            {published ? 'Published' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t-1 border-solid border-borderSubdued pt-4">
        <Button
          kind="tertiary"
          onClick={() => router.push(`${editBase}/details`)}
        >
          Previous
        </Button>
        {published ? null : (
          <Button
            kind="secondary"
            loading={saving}
            onClick={() => void save(draft, true)}
          >
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}

function LumaEmbedFrame({ embed, title }: { embed: LumaEmbed; title: string }) {
  return (
    <iframe
      src={embed.src}
      title={embed.title || title || 'Luma event'}
      className="h-[640px] w-full rounded-3 border-1 border-solid border-borderSubdued"
      allow={embed.allow || undefined}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
    />
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
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
