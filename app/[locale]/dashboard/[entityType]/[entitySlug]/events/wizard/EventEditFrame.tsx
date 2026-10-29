'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import {
  emptyEventDraft,
  entityHeaders,
  eventsBasePath,
  formatLumaEmbed,
  isEventComplete,
  type LumaEmbed,
} from '../model';
import { eventEditorQuery } from '../queries';
import { EventWizardShell } from './EventWizardShell';
import { useEventEditStatus } from './context';

export function eventToDraft(event: {
  name?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  lumaEmbed?: LumaEmbed | null;
}) {
  return {
    ...emptyEventDraft(),
    name: event.name ?? '',
    location: event.location ?? '',
    startDate: String(event.startDate ?? '').slice(0, 10),
    endDate: String(event.endDate ?? '').slice(0, 10),
    lumaEmbed: formatLumaEmbed(event.lumaEmbed),
  };
}

export function EventEditFrame({ children }: { children: ReactNode }) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const pathname = usePathname();
  const router = useRouter();
  const {
    status,
    runBeforeNavigateHandler,
    detailsComplete,
    setDetailsComplete,
    titleOverride,
    saveTitle,
    setStepShowErrors,
  } = useEventEditStatus();

  const headers = entityHeaders(params.entityType, params.entitySlug);
  const currentStep = pathname?.includes('/preview') ? 2 : 1;
  const editBase = `${eventsBasePath(params.entityType, params.entitySlug)}/edit/${params.id}`;

  const eventQuery = useQuery(
    ['event_editor', params.id],
    () => GraphQL(eventEditorQuery, headers, { eventId: params.id }),
    { enabled: Boolean(params.id) }
  );

  const loadedName = eventQuery.data?.event?.name ?? '';

  useEffect(() => {
    const event = eventQuery.data?.event;
    if (!event) return;
    setDetailsComplete(isEventComplete(eventToDraft(event)));
  }, [eventQuery.data, setDetailsComplete]);

  const handleStepClick = (step: number) => {
    const nextPath = step === 2 ? 'preview' : 'details';
    const destination = `${editBase}/${nextPath}`;
    if (pathname?.includes(`/${nextPath}`)) return;
    void runBeforeNavigateHandler()
      .then((shouldContinue) => {
        if (shouldContinue === false) return;
        router.push(destination);
      })
      .catch(() => {
        setStepShowErrors(true);
      });
  };

  return (
    <EventWizardShell
      title={titleOverride ?? loadedName}
      titlePending={!eventQuery.isFetched && !titleOverride}
      onTitleSave={saveTitle}
      goBackURL={eventsBasePath(params.entityType, params.entitySlug)}
      status={status}
      currentStep={currentStep}
      detailsComplete={detailsComplete}
      onStepClick={handleStepClick}
      setStepShowErrors={setStepShowErrors}
    >
      {children}
    </EventWizardShell>
  );
}
