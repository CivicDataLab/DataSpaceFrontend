'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  IconClipboardCheck,
  IconCloudUpload,
  IconFileDescription,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Stepper, useStepperStep } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useDatasetEditStatus } from '../context';
import {
  datasetSummaryQueryDoc,
  isDatasetMetadataComplete,
} from '../dataset-summary';
import styles from '../edit.module.scss';
import { WizardHeader } from './WizardHeader';

interface LayoutProps {
  children?: ReactNode;
  params: { id: string };
}

const STEP_BY_PATH: Record<string, number> = {
  resources: 1,
  metadata: 2,
  publish: 3,
};

const PATH_BY_STEP: Record<number, string> = {
  1: 'resources',
  2: 'metadata',
  3: 'publish',
};

const layoutList = ['resources', 'metadata', 'publish'];

function StepErrorSync() {
  const { showErrors } = useStepperStep();
  const { setStepShowErrors } = useDatasetEditStatus();

  useEffect(() => {
    setStepShowErrors(showErrors);
  }, [showErrors, setStepShowErrors]);

  return null;
}

function stepContent(isActive: boolean, children: ReactNode) {
  if (!isActive) return null;
  return (
    <>
      <StepErrorSync />
      {children}
    </>
  );
}

export function EditLayout({ children, params }: LayoutProps) {
  const pathName = usePathname();
  const router = useRouter();
  const routerParams = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const getDatasetTitleRes = useQuery(
    [`dataset_title_${routerParams.id}`],
    () =>
      GraphQL(
        datasetSummaryQueryDoc,
        {
          [routerParams.entityType]: routerParams.entitySlug,
        },
        {
          filters: {
            id: routerParams.id,
          },
        }
      )
  );

  const pathItem = layoutList.find((item) => pathName.indexOf(item) >= 0);
  const currentStep = pathItem ? STEP_BY_PATH[pathItem] : 1;
  const dataset = getDatasetTitleRes.data?.datasets[0];
  const completionReady = getDatasetTitleRes.isFetched;
  const isPromptDataset = dataset?.datasetType === 'PROMPT';

  const {
    status,
    runBeforeNavigateHandler,
    filesCompleted,
    setFilesCompleted,
    metadataCompleted,
    setMetadataCompleted,
  } = useDatasetEditStatus();

  useEffect(() => {
    if (!dataset) return;
    setFilesCompleted((dataset.resources?.length ?? 0) > 0);
    if (pathItem !== 'metadata') {
      if (isDatasetMetadataComplete(dataset)) {
        setMetadataCompleted(true);
      }
    }
  }, [dataset, pathItem, setFilesCompleted, setMetadataCompleted]);

  if (!pathItem) {
    return <>{children}</>;
  }

  const goBackURL = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/dataset`;
  const stepBase = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/dataset/${params.id}/edit`;

  const handleStepClick = (step: number) => {
    const nextPath = PATH_BY_STEP[step];
    if (!nextPath || nextPath === pathItem) return;
    void runBeforeNavigateHandler().then(() => {
      router.push(`${stepBase}/${nextPath}`);
    });
  };

  const steps: StepperItem[] = [
    {
      step: 1,
      label: isPromptDataset ? 'Prompt Files' : 'Data Files',
      description: isPromptDataset
        ? 'Upload prompt files'
        : 'Upload dataset files',
      icon: IconCloudUpload,
      isCompleted: filesCompleted || (!completionReady && currentStep > 1),
      content: stepContent(currentStep === 1, children),
    },
    {
      step: 2,
      label: 'Metadata',
      description: 'Name, description & settings',
      icon: IconFileDescription,
      isCompleted:
        metadataCompleted || (!completionReady && currentStep > 2),
      content: stepContent(currentStep === 2, children),
    },
    {
      step: 3,
      label: 'Review & Publish',
      description: 'Final review & publish',
      icon: IconClipboardCheck,
      isCompleted: filesCompleted && metadataCompleted,
      content: stepContent(currentStep === 3, children),
    },
  ];

  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={
          getDatasetTitleRes.isFetched ? (dataset?.title ?? '') : '\u00a0'
        }
        goBackURL={goBackURL}
        status={status}
      />
      <Stepper
        className={styles.datasetStepper}
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        restrictNavigation
        navigation={currentStep !== 3}
        nextLabel="Continue"
        previousLabel="Previous"
      />
    </div>
  );
}
