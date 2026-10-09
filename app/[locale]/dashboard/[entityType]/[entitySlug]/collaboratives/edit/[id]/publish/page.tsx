'use client';

import { useParams, useRouter } from 'next/navigation';
import { IconAlertTriangle, IconCircleCheck, IconSend } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  aboutEditTarget,
  contentEditTarget,
  errorMessage,
  isCollaborativeAboutComplete,
  isCollaborativeContentComplete,
  plainSummary,
} from '../../collaborative-summary';
import {
  FetchCollaborativeReview,
  publishCollaborativeMutation,
} from '../../wizard-documents';

function ReadinessRow({
  ok,
  label,
  detail,
  onEdit,
}: {
  ok: boolean;
  label: string;
  detail: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b-1 border-solid border-borderSubdued py-3 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        {ok ? (
          <IconCircleCheck size={20} className="mt-0.5 shrink-0 text-textSuccess" />
        ) : (
          <IconAlertTriangle size={20} className="mt-0.5 shrink-0 text-textCritical" />
        )}
        <div className="min-w-0">
          <Text fontWeight="semibold">{label}</Text>
          <div className="mt-1">
            <Text variant="bodySm" color="subdued">
              {detail}
            </Text>
          </div>
        </div>
      </div>
      {onEdit ? (
        <Button kind="secondary" size="slim" onClick={onEdit}>
          Edit
        </Button>
      ) : null}
    </div>
  );
}

export default function PublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const ownerArgs = { [params.entityType]: params.entitySlug };
  const stepBase = `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}`;

  const reviewQuery = useQuery(
    [`collaborative_wizard_${params.id}`],
    () =>
      GraphQL(FetchCollaborativeReview, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: 'always' }
  );

  const { mutate, isLoading: publishing } = useMutation(
    () =>
      GraphQL(publishCollaborativeMutation, ownerArgs, {
        collaborativeId: params.id,
      }),
    {
      onSuccess: () => {
        toast('Collaborative published successfully');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives`
        );
      },
      onError: (error: unknown) => {
        toast(errorMessage(error, 'Unable to publish this collaborative.'));
      },
    }
  );

  const collaborative = reviewQuery.data?.collaboratives?.[0];

  if (reviewQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const aboutOk = isCollaborativeAboutComplete(collaborative ?? {});
  const contentOk = isCollaborativeContentComplete(collaborative ?? {});
  const contributorCount = collaborative?.contributors?.length ?? 0;
  const partnerCount = collaborative?.partnerOrganizations?.length ?? 0;
  const supporterCount = collaborative?.supportingOrganizations?.length ?? 0;
  const peopleCount = contributorCount + partnerCount + supporterCount;
  const ready = aboutOk && contentOk;
  const published = collaborative?.status === 'PUBLISHED';
  const previewHref = `/collaboratives/${collaborative?.slug || params.id}`;

  const aboutDetail = aboutOk
    ? 'Name, description, sectors, and SDG goals added.'
    : [
        !collaborative?.title?.trim() ? 'Enter a Collaborative name.' : null,
        !plainSummary(collaborative?.summary)
          ? 'Add a description to continue.'
          : null,
        (collaborative?.sectors?.length ?? 0) === 0
          ? 'Select at least one sector.'
          : null,
        (collaborative?.sdgs?.length ?? 0) === 0
          ? 'Select at least one SDG goal.'
          : null,
      ]
        .filter(Boolean)
        .join(' ');

  const relationshipBits = [
    contributorCount ? `${contributorCount} Contributor` : null,
    partnerCount ? `${partnerCount} Partner` : null,
    supporterCount ? `${supporterCount} Supporter` : null,
  ].filter(Boolean);

  const peopleDetail =
    peopleCount > 0
      ? `${peopleCount} people and organisations added${
          relationshipBits.length ? ` — ${relationshipBits.join(', ')}` : ''
        }`
      : 'No people or organisations added yet.';

  const datasetCount = collaborative?.datasets?.length ?? 0;
  const useCaseCount = collaborative?.useCases?.length ?? 0;
  const contentDetail = contentOk
    ? `${datasetCount} dataset${datasetCount === 1 ? '' : 's'} and ${useCaseCount} use case${useCaseCount === 1 ? '' : 's'} connected.`
    : 'Add at least one dataset or use case to continue.';

  return (
    <div className="flex flex-col gap-6 px-6">
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

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4">
        <div className="pt-4">
          <Text fontWeight="semibold">
            {ready ? 'Ready to publish' : 'Needs attention'}
          </Text>
        </div>
        <ReadinessRow
          ok={aboutOk}
          label="About"
          detail={aboutDetail}
          onEdit={
            aboutOk
              ? undefined
              : () =>
                  router.push(
                    `${stepBase}/about#${aboutEditTarget(collaborative ?? {})}`
                  )
          }
        />
        <ReadinessRow ok label="People" detail={peopleDetail} />
        <ReadinessRow
          ok={contentOk}
          label="Content"
          detail={contentDetail}
          onEdit={
            contentOk
              ? undefined
              : () =>
                  router.push(
                    `${stepBase}/content#${contentEditTarget(collaborative ?? {})}`
                  )
          }
        />
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2 border-1 border-solid border-borderSubdued p-6 text-center">
        <Text>
          Open a full preview of this Collaborative in a new tab, exactly as it
          will appear once published.
        </Text>
        <Button kind="primary" url={previewHref} external>
          Preview Collaborative
        </Button>
        <Text variant="bodySm" color="subdued">
          Publishing happens from this review step.
        </Text>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2 border-1 border-solid border-borderSubdued p-4">
        <Button
          className="w-1/3 rounded-2 bg-[var(--primary)] py-2 hover:bg-[#0b2540]"
          disabled={!ready || published}
          loading={publishing}
          onClick={() => mutate()}
        >
          <span className="flex items-center justify-center gap-2 font-bold">
            {published ? 'Published' : 'Publish Collaborative'}
            <IconSend size={20} strokeWidth={1.5} />
          </span>
        </Button>
      </div>

      <div>
        <Button
          kind="tertiary"
          onClick={() => router.push(`${stepBase}/content`)}
        >
          Previous
        </Button>
      </div>
    </div>
  );
}
