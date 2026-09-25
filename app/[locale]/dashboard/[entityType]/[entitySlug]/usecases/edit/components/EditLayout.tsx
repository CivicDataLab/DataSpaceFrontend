'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import {
  IconClipboardCheck,
  IconLayout2,
  IconShare,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stepper, toast, useStepperStep } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useUseCaseEditStatus } from '../context';
import styles from '../edit.module.scss';
import {
  isUseCaseBuilderComplete,
  isUseCaseConnectComplete,
  useCaseWizardSummaryQuery,
} from '../usecase-summary';
import { WizardHeader } from './WizardHeader';

interface LayoutProps {
  children?: ReactNode;
  params: { id: string };
}

const STEP_BY_PATH: Record<string, number> = {
  builder: 1,
  connect: 2,
  publish: 3,
};

const PATH_BY_STEP: Record<number, string> = {
  1: 'builder',
  2: 'connect',
  3: 'publish',
};

const layoutList = ['builder', 'connect', 'publish'];

const UpdateUseCaseTitleMutation = graphql(`
  mutation updateUseCaseWizardTitle($data: UseCaseInputPartial!) {
    updateUseCase(data: $data) {
      __typename
      id
      title
    }
  }
`);

function StepErrorSync() {
  const { showErrors } = useStepperStep();
  const { setStepShowErrors } = useUseCaseEditStatus();

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
  const queryClient = useQueryClient();

  const summaryQuery = useQuery(
    [`usecase_wizard_${routerParams.id}`],
    () =>
      GraphQL(
        useCaseWizardSummaryQuery,
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
  const useCase = summaryQuery.data?.useCases[0];
  const completionReady = summaryQuery.isFetched;

  const {
    status,
    setStatus,
    runBeforeNavigateHandler,
    builderCompleted,
    setBuilderCompleted,
    connectCompleted,
    setConnectCompleted,
  } = useUseCaseEditStatus();

  useEffect(() => {
    if (!useCase) return;
    if (pathItem !== 'builder') {
      setBuilderCompleted(isUseCaseBuilderComplete(useCase));
    }
    if (pathItem !== 'connect') {
      setConnectCompleted(isUseCaseConnectComplete(useCase));
    }
  }, [useCase, pathItem, setBuilderCompleted, setConnectCompleted]);

  const { mutate: saveTitle } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(
        UpdateUseCaseTitleMutation,
        {
          [routerParams.entityType]: routerParams.entitySlug,
        },
        data
      ),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: () => {
        void summaryQuery.refetch();
        void queryClient.invalidateQueries({
          queryKey: [`fetch_UseCaseBuilder`, params.id],
        });
        setStatus('success');
      },
      onError: (error: unknown) => {
        setStatus('success');
        toast(
          typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Unable to update title right now.'
        );
      },
    }
  );

  if (!pathItem) {
    return <>{children}</>;
  }

  const goBackURL = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/usecases`;
  const stepBase = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/usecases/edit/${params.id}`;

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
      label: 'Builder',
      description: 'Create and structure your Use Case',
      icon: IconLayout2,
      isCompleted:
        builderCompleted || (!completionReady && currentStep > 1),
      content: stepContent(currentStep === 1, children),
    },
    {
      step: 2,
      label: 'Connect',
      description: 'Add context, datasets, and contributors',
      icon: IconShare,
      isCompleted:
        connectCompleted || (!completionReady && currentStep > 2),
      content: stepContent(currentStep === 2, children),
    },
    {
      step: 3,
      label: 'Review & Publish',
      description: 'Check readiness',
      icon: IconClipboardCheck,
      isCompleted: builderCompleted && connectCompleted,
      content: stepContent(currentStep === 3, children),
    },
  ];

  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={useCase?.title ?? ''}
        titlePending={!summaryQuery.isFetched}
        goBackURL={goBackURL}
        status={status}
        onTitleSave={(nextTitle) =>
          saveTitle({ data: { id: params.id, title: nextTitle } })
        }
      />
      <Stepper
        className={styles.useCaseStepper}
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
