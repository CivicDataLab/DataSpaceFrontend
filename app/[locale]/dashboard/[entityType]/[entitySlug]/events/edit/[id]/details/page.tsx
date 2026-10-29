'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionCard, Spinner, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  emptyEventDraft,
  entityHeaders,
  errorText,
  eventFieldErrors,
  eventWriteInput,
  isEventComplete,
  mutationMessage,
  type EventDraft,
} from '../../../model';
import { eventEditorQuery, updateEventMutation } from '../../../queries';
import { eventToDraft } from '../../../wizard/EventEditFrame';
import { useEventEditStatus } from '../../../wizard/context';

export default function EventDetailsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const queryClient = useQueryClient();
  const {
    setStatus,
    setDetailsComplete,
    setTitleOverride,
    registerTitleSave,
    registerBeforeNavigateHandler,
    stepShowErrors,
  } = useEventEditStatus();

  const [form, setForm] = useState<EventDraft | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const hydrated = useRef(false);
  const formRef = useRef<EventDraft>(emptyEventDraft());

  const editorQuery = useQuery(
    ['event_editor', params.id],
    () => GraphQL(eventEditorQuery, headers, { eventId: params.id }),
    { enabled: Boolean(params.id) }
  );

  const event = editorQuery.data?.event;
  const current = form ?? (event ? eventToDraft(event) : emptyEventDraft());
  formRef.current = current;

  useEffect(() => {
    if (!event || hydrated.current) return;
    hydrated.current = true;
    setTitleOverride(event.name ?? '');
    setDetailsComplete(isEventComplete(eventToDraft(event)));
  }, [event, setDetailsComplete, setTitleOverride]);

  const updateForm = (patch: Partial<EventDraft>) => {
    const next = { ...formRef.current, ...patch };
    formRef.current = next;
    setForm(next);
    setDetailsComplete(isEventComplete(next));
    if (patch.name !== undefined) setTitleOverride(next.name);
    return next;
  };

  const persist = async (draft: EventDraft, requireComplete: boolean) => {
    const errors = eventFieldErrors(draft, requireComplete);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      throw new Error('incomplete');
    }

    setStatus('loading');
    try {
      const result = await GraphQL(updateEventMutation, headers, {
        input: { id: params.id, ...eventWriteInput(draft) },
      });
      const message = mutationMessage(result.updateEvent, 'Could not save the event.');
      if (message) throw new Error(message);
      setDetailsComplete(isEventComplete(draft));
      setTitleOverride(draft.name);
      await queryClient.invalidateQueries({ queryKey: ['event_editor', params.id] });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'incomplete') {
        toast(errorText(error, 'Could not save the event.'));
      }
      throw error;
    } finally {
      setStatus('success');
    }
  };

  useEffect(() => {
    registerTitleSave((title) => {
      if (!hydrated.current) return;
      const next = updateForm({ name: title });
      void persist(next, false).catch(() => undefined);
    });
    registerBeforeNavigateHandler(async () => {
      if (!hydrated.current && editorQuery.isLoading) {
        throw new Error('Still loading');
      }
      await persist(formRef.current, true);
    });
    return () => registerBeforeNavigateHandler(null);
  });

  if (editorQuery.isLoading && !event) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (editorQuery.isError) {
    return <div>Could not load this event.</div>;
  }

  const errors = showErrors || stepShowErrors ? eventFieldErrors(current, true) : {};

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Event">
        <div className="flex flex-col gap-5">
          <TextField
            name="eventName"
            label="Name"
            required
            requiredIndicator
            value={current.name}
            error={errors.name}
            onChange={(value) => updateForm({ name: value })}
          />
          <TextField
            name="eventLocation"
            label="Location"
            required
            requiredIndicator
            value={current.location}
            error={errors.location}
            onChange={(value) => updateForm({ location: value })}
          />
          <TextField
            name="eventStartDate"
            label="Start date"
            type="date"
            required
            requiredIndicator
            value={current.startDate}
            error={errors.startDate}
            onChange={(value) => updateForm({ startDate: value })}
          />
          <TextField
            name="eventEndDate"
            label="End date"
            type="date"
            required
            requiredIndicator
            value={current.endDate}
            error={errors.endDate}
            onChange={(value) => updateForm({ endDate: value })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Luma embed">
        <TextField
          name="lumaEmbed"
          label="Embed iframe"
          required
          requiredIndicator
          multiline={5}
          value={current.lumaEmbed}
          error={errors.lumaEmbed}
          helpText="Paste the iframe from Luma, or an https://lu.ma/embed/ URL."
          onChange={(value) => updateForm({ lumaEmbed: value })}
        />
      </SectionCard>
    </div>
  );
}
