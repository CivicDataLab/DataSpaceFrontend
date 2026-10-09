'use client';

import { ReactNode, useEffect } from 'react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { graphql } from '@/gql';
import {
  IconClipboardCheck,
  IconFileDescription,
  IconVersions,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stepper, toast, useStepperStep } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { isModelInfoComplete } from './aimodel-summary';
import { WizardHeader } from './components/WizardHeader';
import { EditStatusProvider, useEditStatus } from './context';
import styles from './edit.module.scss';
import { FetchAIModelForPublish } from './[id]/publish/page';

const UpdateAIModelNameMutation = graphql(`
  mutation updateAIModelName($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        displayName
      }
    }
  }
`);

const STEP_BY_PATH: Record<string, number> = {
  versions: 1,
  details: 2,
  publish: 3,
};

const PATH_BY_STEP: Record<number, string> = {
  1: 'versions',
  2: 'details',
  3: 'publish',
};

const layoutList = ['versions', 'details', 'publish'];

function StepErrorSync() {
  const { showErrors } = useStepperStep();
  const { setStepShowErrors } = useEditStatus();

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

function Wizard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();

  const pathItem = layoutList.find((item) => pathName.includes(`/${item}`));
  const currentStep = pathItem ? STEP_BY_PATH[pathItem] : 1;

  const summaryQuery = useQuery(
    [
      `fetch_AIModelForPublish`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
    () =>
      GraphQL(
        FetchAIModelForPublish,
        { [params.entityType]: params.entitySlug },
        { filters: { id: parseInt(params.id, 10) } }
      ),
    {
      enabled: Boolean(params.id),
      refetchOnMount: true,
    }
  );

  const model = summaryQuery.data?.aiModels?.[0];
  const completionReady = summaryQuery.isFetched;
  const {
    status,
    setStatus,
    versionsCompleted,
    setVersionsCompleted,
    infoCompleted,
    setInfoCompleted,
    runBeforeNavigateHandler,
  } = useEditStatus();

  useEffect(() => {
    if (!model || !pathItem) return;
    if (pathItem !== 'versions') {
      setVersionsCompleted((model.versions?.length ?? 0) > 0);
    }
    if (pathItem !== 'details') {
      setInfoCompleted(isModelInfoComplete(model));
    }
  }, [model, pathItem, setVersionsCompleted, setInfoCompleted]);

  const { mutate: saveTitle, isLoading: titleSaving } = useMutation(
    (displayName: string) =>
      GraphQL(
        UpdateAIModelNameMutation,
        { [params.entityType]: params.entitySlug },
        { input: { id: parseInt(params.id, 10), displayName } }
      ),
    {
      onMutate: () => setStatus('saving'),
      onSuccess: () => {
        setStatus('saved');
        void summaryQuery.refetch();
        void queryClient.invalidateQueries({
          queryKey: [
            `fetch_AIModelDetails`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        toast('AI Model updated successfully', {
          id: 'aimodel-title-save-success',
        });
      },
      onError: (error: unknown) => {
        setStatus('unsaved');
        const message =
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
            ? error.message
            : 'Unable to update the model name.';
        toast(`Error: ${message}`, { id: 'aimodel-title-save-error' });
      },
    }
  );

  if (!pathItem) {
    return <>{children}</>;
  }

  const sourceTab = searchParams.get('tab');
  const goBackURL =
    sourceTab === 'active'
      ? `/dashboard/${params.entityType}/${params.entitySlug}/aimodels?tab=active`
      : `/dashboard/${params.entityType}/${params.entitySlug}/aimodels`;
  const stepBase = `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}`;

  const handleStepClick = (step: number) => {
    const nextPath = PATH_BY_STEP[step];
    if (!nextPath || nextPath === pathItem) return;
    void runBeforeNavigateHandler().then(() => {
      router.push(`${stepBase}/${nextPath}`);
    });
  };

  const primaryVersion =
    model?.versions?.find((version) => version.isLatest) || model?.versions?.[0];
  const accessReady = (primaryVersion?.providers?.length ?? 0) > 0;

  const steps: StepperItem[] = [
    {
      step: 1,
      label: 'Versions',
      description: 'Configure releases and access',
      icon: IconVersions,
      isCompleted:
        versionsCompleted || (!completionReady && currentStep > 1),
      content: stepContent(currentStep === 1, children),
    },
    {
      step: 2,
      label: 'Model Information',
      description: 'Describe the model',
      icon: IconFileDescription,
      isCompleted:
        infoCompleted || (!completionReady && currentStep > 2),
      content: stepContent(currentStep === 2, children),
    },
    {
      step: 3,
      label: 'Review & Publish',
      description: 'Check readiness',
      icon: IconClipboardCheck,
      isCompleted: versionsCompleted && infoCompleted && accessReady,
      content: stepContent(currentStep === 3, children),
    },
  ];

  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={model?.displayName || ''}
        titlePending={!completionReady}
        goBackURL={goBackURL}
        status={status === 'saving' || titleSaving ? 'loading' : 'success'}
        onTitleSave={(nextTitle) => saveTitle(nextTitle)}
      />
      <Stepper
        className={styles.modelStepper}
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

export default function EditAIModel({ children }: { children: ReactNode }) {
  return (
    <EditStatusProvider>
      <Wizard>{children}</Wizard>
    </EditStatusProvider>
  );
}
