'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ImportPlatform,
  type ImportPlatformDatasetInput,
  type TypeDatasetMutationResponse,
} from '@/gql/generated/graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useMutation } from '@tanstack/react-query';
import gql from 'graphql-tag';
import { SparklesIcon } from 'lucide-react';
import { Button, Form, SectionCard, Select, TextField, toast } from 'opub-ui';
import { useFormContext } from 'react-hook-form';

import { GraphQL } from '@/lib/api';
import { useDatasetEditStatus } from '../../context';

const importPlatformDatasetDoc: TypedDocumentNode<
  { importPlatformDataset: TypeDatasetMutationResponse },
  { importInput: ImportPlatformDatasetInput }
> = gql`
  mutation ImportPlatformDataset($importInput: ImportPlatformDatasetInput!) {
    importPlatformDataset(importInput: $importInput) {
      success
      errors {
        fieldErrors {
          messages
        }
        nonFieldErrors
      }
      data {
        id
        title
      }
    }
  }
`;

const PLATFORM_API: Record<string, ImportPlatform> = {
  github: ImportPlatform.Github,
  huggingface: ImportPlatform.Huggingface,
  kaggle: ImportPlatform.Kaggle,
};

const PLATFORM_OPTIONS = [
  {
    label: 'GitHub',
    value: 'github',
    placeholder: 'https://github.com/owner/repository',
    helpText: 'Paste the GitHub repository URL that holds the dataset files.',
  },
  {
    label: 'Hugging Face',
    value: 'huggingface',
    placeholder: 'https://huggingface.co/datasets/owner/repository',
    helpText:
      'Paste the Hugging Face dataset URL that holds the dataset files.',
  },
  {
    label: 'Kaggle',
    value: 'kaggle',
    placeholder: 'https://kaggle.com/datasets/owner/repository',
    helpText: 'Paste the Kaggle dataset URL that holds the dataset files.',
  },
];

const platformFormOptions = {
  defaultValues: {
    platform: '',
  },
};

function SyncPlatformError({ error }: { error?: string }) {
  const { setError, clearErrors } = useFormContext();

  useEffect(() => {
    if (error) {
      setError('platform', { type: 'manual', message: error });
    } else {
      clearErrors('platform');
    }
  }, [error, setError, clearErrors]);

  return null;
}

export interface PlatformImportDraft {
  platform: string;
  datasetUrl: string;
}

const FORM_PLATFORM: Record<string, string> = {
  GITHUB: 'github',
  HUGGINGFACE: 'huggingface',
  KAGGLE: 'kaggle',
};

export function platformDraftFromSource(
  source?: {
    platform?: string | null;
    sourceUrl?: string | null;
  } | null
): PlatformImportDraft | null {
  const platform = FORM_PLATFORM[source?.platform ?? ''] ?? '';
  const datasetUrl = source?.sourceUrl?.trim() ?? '';
  if (!platform && !datasetUrl) return null;
  return { platform, datasetUrl };
}

interface PublicPlatformImportProps {
  initialDraft?: PlatformImportDraft;
  onDraftChange?: (draft: PlatformImportDraft) => void;
}

function importErrorMessage(err: unknown) {
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
  ) {
    return err.message.trim();
  }
  return 'Unable to generate dataset metadata.';
}

export function PublicPlatformImport({
  initialDraft,
  onDraftChange,
}: PublicPlatformImportProps) {
  const { stepShowErrors } = useDatasetEditStatus();
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
  }>();
  const [platform, setPlatform] = useState(initialDraft?.platform ?? '');
  const [datasetUrl, setDatasetUrl] = useState(initialDraft?.datasetUrl ?? '');
  const [urlBlurred, setUrlBlurred] = useState(false);

  const generateMutation = useMutation(
    (importInput: ImportPlatformDatasetInput) =>
      GraphQL(
        importPlatformDatasetDoc,
        { [params.entityType]: params.entitySlug },
        { importInput }
      ),
    {
      onSuccess: (data) => {
        const result = data.importPlatformDataset;
        const datasetId = result.data?.id;
        if (!result.success || !datasetId) {
          toast(
            result.errors?.nonFieldErrors?.[0] ??
              result.errors?.fieldErrors?.[0]?.messages[0] ??
              'Unable to generate dataset metadata.',
            { id: 'dataset-platform-generate-error' }
          );
          return;
        }

        toast('Dataset metadata generated from the platform.');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${datasetId}/edit/resources`
        );
      },
      onError: (err: unknown) => {
        toast(importErrorMessage(err), {
          id: 'dataset-platform-generate-error',
        });
      },
    }
  );

  useEffect(() => {
    onDraftChange?.({ platform, datasetUrl });
  }, [platform, datasetUrl, onDraftChange]);

  const showUrlField = platform.length > 0;
  const showUrlError =
    showUrlField &&
    datasetUrl.trim().length === 0 &&
    (stepShowErrors || urlBlurred);
  const platformError =
    stepShowErrors && !platform ? 'Select a platform.' : undefined;
  const apiPlatform = PLATFORM_API[platform];
  const canGenerate = Boolean(apiPlatform) && datasetUrl.trim().length > 0;

  const generate = () => {
    if (
      !apiPlatform ||
      datasetUrl.trim().length === 0 ||
      generateMutation.isLoading
    ) {
      return;
    }
    generateMutation.mutate({
      platform: apiPlatform,
      identifier: datasetUrl.trim(),
    });
  };

  return (
    <SectionCard
      title="Import from a public platform"
      description="Select a platform and paste the dataset URL. Generate fills the metadata from that platform."
    >
      <Form formOptions={platformFormOptions}>
        <SyncPlatformError error={platformError} />
        <div className="flex flex-col gap-4">
          <Select
            name="platform"
            label="Select Platform"
            requiredIndicator
            placeholder="Select a platform..."
            options={PLATFORM_OPTIONS.map(({ label, value }) => ({
              label,
              value,
            }))}
            value={platform}
            error={platformError}
            onChange={(value) => {
              setPlatform(value);
              setDatasetUrl('');
              setUrlBlurred(false);
            }}
          />
          {showUrlField ? (
            <TextField
              name="datasetUrl"
              label={`${PLATFORM_OPTIONS.find((p) => p.value === platform)?.label} URL`}
              requiredIndicator
              type="url"
              value={datasetUrl}
              placeholder={
                PLATFORM_OPTIONS.find((p) => p.value === platform)?.placeholder
              }
              helpText={
                PLATFORM_OPTIONS.find((p) => p.value === platform)?.helpText
              }
              error={showUrlError ? 'Enter the dataset URL.' : undefined}
              onChange={setDatasetUrl}
              onBlur={() => setUrlBlurred(true)}
            />
          ) : null}
          <div className="flex justify-start">
            <Button
              kind="primary"
              disabled={!canGenerate}
              loading={generateMutation.isLoading}
              onClick={(event) => {
                event.preventDefault();
                generate();
              }}
              icon={<SparklesIcon className="size-4" />}
            >
              Generate
            </Button>
          </div>
        </div>
      </Form>
    </SectionCard>
  );
}
