'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  IconClipboardCheck,
  IconCloudUpload,
  IconFileDescription,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Icon, Text } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { WizardFrame } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/WizardFrame';
import { wizardStepContent } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/step-content';
import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';
import { useDatasetEditStatus } from '../context';
import {
  datasetSummaryQueryDoc,
  isDatasetMetadataComplete,
} from '../dataset-summary';
import styles from '../edit.module.scss';

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
    setStepShowErrors,
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
      content: wizardStepContent(
        currentStep === 1,
        children,
        setStepShowErrors
      ),
    },
    {
      step: 2,
      label: 'Metadata',
      description: 'Name, description & settings',
      icon: IconFileDescription,
      isCompleted:
        metadataCompleted || (!completionReady && currentStep > 2),
      content: wizardStepContent(
        currentStep === 2,
        children,
        setStepShowErrors
      ),
    },
    {
      step: 3,
      label: 'Review & Publish',
      description: 'Final review & publish',
      icon: IconClipboardCheck,
      isCompleted: filesCompleted && metadataCompleted,
      content: wizardStepContent(
        currentStep === 3,
        children,
        setStepShowErrors
      ),
    },
  ];

  return (
    <WizardFrame
      title={dataset?.title ?? ''}
      untitledLabel="Untitled dataset"
      titlePending={!getDatasetTitleRes.isFetched}
      goBackURL={goBackURL}
      status={status}
      stepperClassName={styles.datasetStepper}
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      showNavigation={currentStep !== 3}
      footer={
        <div className="border ml-3 flex w-fit items-center gap-2 rounded-full border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault px-2 py-1">
          <Icon source={Icons.globe} size={16} color="default" />
          <Text variant="bodySm" color="subdued" className=" text-textSubdued">
            Public visibility · Public once published
          </Text>
        </div>
      }
    />
  );
}
