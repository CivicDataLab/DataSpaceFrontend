'use client';

import { useEffect, useState } from 'react';
import { Form, SectionCard, Select, TextField } from 'opub-ui';
import { useFormContext } from 'react-hook-form';

import { useDatasetEditStatus } from '../../context';

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

export function PublicPlatformImport() {
  const { stepShowErrors } = useDatasetEditStatus();
  const [platform, setPlatform] = useState('');
  const [datasetUrl, setDatasetUrl] = useState('');
  const [urlBlurred, setUrlBlurred] = useState(false);

  const showUrlField = platform.length > 0;
  const showUrlError =
    showUrlField &&
    datasetUrl.trim().length === 0 &&
    (stepShowErrors || urlBlurred);
  const platformError =
    stepShowErrors && !platform ? 'Select a platform.' : undefined;

  return (
    <SectionCard
      title="Import from a public platform"
      description="Select a platform, paste the dataset URL, then extract its files into this dataset."
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
        </div>
      </Form>
    </SectionCard>
  );
}
