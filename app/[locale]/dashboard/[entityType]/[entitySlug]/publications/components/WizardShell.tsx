'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  IconClipboardCheck,
  IconCloudUpload,
  IconFileDescription,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stepper, toast, useStepperStep } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { usePublicationDraft } from '../context';
import styles from '../edit.module.scss';
import { errorText, isDetailsComplete } from '../model';
import {
  publicationEditorQuery,
  updatePublicationMutation,
} from '../queries';
import { WizardHeader } from './WizardHeader';

const STEP_BY_PATH: Record<string, number> = {
  files: 1,
  details: 2,
  publish: 3,
};

const PATH_BY_STEP: Record<number, string> = {
  1: 'files',
  2: 'details',
  3: 'publish',
};

const layoutList = ['files', 'details', 'publish'];

function StepErrorSync() {
  const { showErrors } = useStepperStep();
  const { setShowErrors } = usePublicationDraft();

  useEffect(() => {
    setShowErrors(showErrors);
  }, [showErrors, setShowErrors]);

  return null;
}

export function PublicationWizard({
  mode,
  children,
}: {
  mode: 'new' | 'edit';
  children: ReactNode;
}) {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id?: string;
  }>();
  const queryClient = useQueryClient();
  const {
    details,
    detailsReady,
    setDetails,
    pendingBlocks,
    status,
    setStatus,
    runBeforeNavigateHandler,
  } = usePublicationDraft();

  const publicationId = mode === 'edit' ? params.id : undefined;
  const pathItem = layoutList.find((item) => pathName.includes(`/${item}`));
  const currentStep = pathItem ? STEP_BY_PATH[pathItem] : 1;

  const editorQuery = useQuery(
    ['publication_editor', publicationId],
    () =>
      GraphQL(
        publicationEditorQuery,
        { [params.entityType]: params.entitySlug },
        { publicationId: publicationId ?? '' }
      ),
    { enabled: Boolean(publicationId) }
  );

  const publication = editorQuery.data?.getPublication;
  const title = mode === 'new' ? details.title : (publication?.title ?? '');
  const completionReady = mode === 'new' || editorQuery.isFetched;
  const detailsComplete =
    (mode === 'new'
      ? isDetailsComplete(details)
      : Boolean(
          publication?.title?.trim() &&
            publication.description?.trim() &&
            (publication.authors?.length ?? 0) > 0 &&
            publication.publicationDate &&
            publication.license &&
            publication.resourceType?.id &&
            (publication.sectors?.length ?? 0) > 0 &&
            (publication.geographies?.length ?? 0) > 0
        )) || detailsReady;
  const hasBlocks =
    (publication?.blocks?.length ?? 0) > 0 || pendingBlocks.length > 0;

  const { mutate: saveTitle } = useMutation(
    (nextTitle: string) =>
      GraphQL(
        updatePublicationMutation,
        { [params.entityType]: params.entitySlug },
        { input: { id: publicationId ?? '', title: nextTitle } }
      ),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const payload = result.updatePublication;
        if (!payload?.success) {
          setStatus('unsaved');
          toast('Could not update the publication name.');
          return;
        }
        setStatus('success');
        toast('Publication updated successfully', {
          id: 'publication-save-success',
        });
        void editorQuery.refetch();
        void queryClient.invalidateQueries({
          queryKey: ['publication_editor', publicationId],
        });
      },
      onError: (error: unknown) => {
        setStatus('unsaved');
        toast(errorText(error, 'Could not update the publication name.'));
      },
    }
  );

  if (!pathItem) {
    return <>{children}</>;
  }

  const goBackURL = `/dashboard/${params.entityType}/${params.entitySlug}/publications`;

  const handleStepClick = (step: number) => {
    const nextPath = PATH_BY_STEP[step];
    if (!nextPath || nextPath === pathItem) return;
    void runBeforeNavigateHandler()
      .then((result) => {
        const id = result?.id || publicationId;
        const resolvedStep = result?.step ?? step;
        const resolvedPath = PATH_BY_STEP[resolvedStep];
        if (!resolvedPath) return;
        if (resolvedPath === 'publish' && !id) return;
        const base = id
          ? `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${id}`
          : `/dashboard/${params.entityType}/${params.entitySlug}/publications/new`;
        router.push(`${base}/${resolvedPath}`);
      })
      .catch(() => undefined);
  };

  const steps: StepperItem[] = [
    {
      step: 1,
      label: 'Files',
      description: 'Upload files & videos',
      icon: IconCloudUpload,
      isCompleted: hasBlocks || (!completionReady && currentStep > 1),
      content: currentStep === 1 ? children : null,
    },
    {
      step: 2,
      label: 'Details',
      description: 'Name, describe & classify',
      icon: IconFileDescription,
      isCompleted: detailsComplete || (!completionReady && currentStep > 2),
      content:
        currentStep === 2 ? (
          <>
            <StepErrorSync />
            {children}
          </>
        ) : null,
    },
    {
      step: 3,
      label: 'Review & Publish',
      description: 'Check readiness',
      icon: IconClipboardCheck,
      isCompleted: false,
      content: currentStep === 3 ? children : null,
    },
  ];

  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={title}
        titlePending={mode === 'edit' && !editorQuery.isFetched}
        goBackURL={goBackURL}
        status={status}
        onTitleSave={(nextTitle) => {
          if (mode === 'new') {
            setDetails((current) => ({ ...current, title: nextTitle }));
            return;
          }
          saveTitle(nextTitle);
        }}
      />
      <Stepper
        className={styles.publicationStepper}
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
