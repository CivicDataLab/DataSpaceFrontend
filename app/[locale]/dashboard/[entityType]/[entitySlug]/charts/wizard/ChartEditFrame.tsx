'use client';

import { ReactNode } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { ChartWizardShell } from './ChartWizardShell';
import { useChartEditStatus } from './context';
import { chartImageDetailsDoc, chartWizardDetailsDoc } from './documents';
import { chartsBasePath, entityHeaders } from './model';

export function ChartEditFrame({
  kind,
  children,
}: {
  kind: 'viz' | 'image';
  children: ReactNode;
}) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
    imageID: string;
  }>();
  const pathname = usePathname();
  const router = useRouter();
  const {
    status,
    runBeforeNavigateHandler,
    buildComplete,
    titleOverride,
    saveTitle,
    setStepShowErrors,
  } = useChartEditStatus();

  const id = kind === 'viz' ? params.chartID : params.imageID;
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const currentStep = pathname?.includes('/publish') ? 2 : 1;
  const editBase = `${chartsBasePath(params.entityType, params.entitySlug)}${
    kind === 'viz' ? `/${id}/edit` : `/image/${id}/edit`
  }`;

  const vizQuery = useQuery(
    [`chart-wizard-title-${id}`],
    () =>
      GraphQL(chartWizardDetailsDoc, headers, {
        chartDetailsId: id,
      }),
    { enabled: kind === 'viz' && Boolean(id) }
  );

  const imageQuery = useQuery(
    [`chart-image-title-${id}`],
    () =>
      GraphQL(chartImageDetailsDoc, headers, {
        imageId: id,
      }),
    { enabled: kind === 'image' && Boolean(id) }
  );

  const loadedTitle =
    kind === 'viz'
      ? vizQuery.data?.resourceChart?.name
      : imageQuery.data?.resourceChartImage?.name;
  const titlePending =
    kind === 'viz' ? !vizQuery.isFetched : !imageQuery.isFetched;

  const handleStepClick = (step: number) => {
    const nextPath = step === 2 ? 'publish' : 'build';
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
    <ChartWizardShell
      title={titleOverride ?? loadedTitle ?? ''}
      titlePending={titlePending && !titleOverride}
      onTitleSave={saveTitle}
      goBackURL={chartsBasePath(params.entityType, params.entitySlug)}
      status={status}
      currentStep={currentStep}
      buildComplete={buildComplete}
      onStepClick={handleStepClick}
      setStepShowErrors={setStepShowErrors}
    >
      {children}
    </ChartWizardShell>
  );
}
