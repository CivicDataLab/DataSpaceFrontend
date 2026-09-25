'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { CollaborativeInputPartial } from '@/gql/generated/graphql';
import {
  IconClipboardCheck,
  IconFileDescription,
  IconShare,
  IconUsers,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stepper, toast, useStepperStep } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  isCollaborativeAboutComplete,
  isCollaborativeContentComplete,
  errorMessage,
} from '../collaborative-summary';
import { useCollaborativeEditStatus } from '../context';
import styles from '../edit.module.scss';
import {
  FetchCollaborativeReview,
  UpdateCollaborativeTitleMutation,
} from '../wizard-documents';
import { WizardHeader } from './WizardHeader';

interface LayoutProps {
  children?: ReactNode;
  params: { id: string };
}

const STEP_BY_PATH: Record<string, number> = {
  about: 1,
  people: 2,
  content: 3,
  publish: 4,
};

const PATH_BY_STEP: Record<number, string> = {
  1: 'about',
  2: 'people',
  3: 'content',
  4: 'publish',
};

const layoutList = ['about', 'people', 'content', 'publish'];

function StepErrorSync() {
  const { showErrors } = useStepperStep();
  const { setStepShowErrors } = useCollaborativeEditStatus();

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
    [`collaborative_wizard_${routerParams.id}`],
    () =>
      GraphQL(
        FetchCollaborativeReview,
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

  const pathItem = layoutList.find((item) => pathName.includes(`/${item}`));
  const currentStep = pathItem ? STEP_BY_PATH[pathItem] : 1;
  const collaborative = summaryQuery.data?.collaboratives?.[0];
  const completionReady = summaryQuery.isFetched;

  const {
    status,
    setStatus,
    runBeforeNavigateHandler,
    aboutCompleted,
    setAboutCompleted,
    peopleCompleted,
    setPeopleCompleted,
    contentCompleted,
    setContentCompleted,
  } = useCollaborativeEditStatus();

  if (pathItem === 'people' && !peopleCompleted) {
    setPeopleCompleted(true);
  }
  if (pathItem === 'content' && !contentCompleted) {
    setContentCompleted(true);
  }

  useEffect(() => {
    if (!collaborative) return;
    if (pathItem !== 'about') {
      setAboutCompleted(isCollaborativeAboutComplete(collaborative));
    }
    if (pathItem !== 'people') {
      const peopleCount =
        (collaborative.contributors?.length ?? 0) +
        (collaborative.partnerOrganizations?.length ?? 0) +
        (collaborative.supportingOrganizations?.length ?? 0);
      setPeopleCompleted(peopleCount > 0);
    }
    if (pathItem !== 'content') {
      setContentCompleted(isCollaborativeContentComplete(collaborative));
    }
  }, [
    collaborative,
    pathItem,
    setAboutCompleted,
    setPeopleCompleted,
    setContentCompleted,
  ]);

  const { mutate: saveTitle } = useMutation(
    (data: { data: CollaborativeInputPartial }) =>
      GraphQL(
        UpdateCollaborativeTitleMutation,
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
          queryKey: [`fetch_collaborative_about_${params.id}`],
        });
        setStatus('success');
      },
      onError: (error: unknown) => {
        setStatus('success');
        toast(errorMessage(error, 'Unable to update title right now.'));
      },
    }
  );

  if (!pathItem) {
    return <>{children}</>;
  }

  const goBackURL = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/collaboratives`;
  const stepBase = `/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/collaboratives/edit/${params.id}`;

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
      label: 'About',
      description: 'What is this?',
      icon: IconFileDescription,
      isCompleted:
        aboutCompleted || (!completionReady && currentStep > 1),
      content: stepContent(currentStep === 1, children),
    },
    {
      step: 2,
      label: 'People',
      description: 'Who is involved?',
      icon: IconUsers,
      isCompleted:
        peopleCompleted || (!completionReady && currentStep > 2),
      content: stepContent(currentStep === 2, children),
    },
    {
      step: 3,
      label: 'Content',
      description: 'What is connected?',
      icon: IconShare,
      isCompleted:
        contentCompleted || (!completionReady && currentStep > 3),
      content: stepContent(currentStep === 3, children),
    },
    {
      step: 4,
      label: 'Review & Publish',
      description: 'Check readiness',
      icon: IconClipboardCheck,
      isCompleted: aboutCompleted && contentCompleted,
      content: stepContent(currentStep === 4, children),
    },
  ];

  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={collaborative?.title ?? ''}
        titlePending={!summaryQuery.isFetched}
        goBackURL={goBackURL}
        status={status}
        onTitleSave={(nextTitle) =>
          saveTitle({ data: { id: params.id, title: nextTitle } })
        }
      />
      <Stepper
        className={styles.collaborativeStepper}
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        restrictNavigation
        navigation={currentStep !== 4}
        nextLabel="Continue"
        previousLabel="Previous"
      />
    </div>
  );
}
