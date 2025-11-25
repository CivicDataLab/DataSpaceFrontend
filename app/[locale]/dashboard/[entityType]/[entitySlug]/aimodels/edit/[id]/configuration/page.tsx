'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, FormLayout, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

const FetchAIModelConfig: any = graphql(`
  query AIModelConfig($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      inputSchema
      outputSchema
      metadata
    }
  }
`);

const UpdateAIModelConfigMutation: any = graphql(`
  mutation updateAIModelConfig($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        inputSchema
        outputSchema
        metadata
      }
    }
  }
`);

export default function ConfigurationPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { setStatus } = useEditStatus();

  const ConfigData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_AIModelConfig_${params.id}`],
    () =>
      GraphQL(
        FetchAIModelConfig,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: parseInt(params.id),
          },
        }
      ),
    {
      refetchOnMount: true,
    }
  );

  const model = ConfigData.data?.aiModels[0];

  const { mutate, isLoading: updateLoading } = useMutation(
    (data: any) =>
      GraphQL(
        UpdateAIModelConfigMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            id: parseInt(params.id),
            ...data,
          },
        }
      ),
    {
      onSuccess: () => {
        toast('Configuration updated successfully');
        setStatus('saved');
        ConfigData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
        setStatus('unsaved');
      },
    }
  );

  const [formData, setFormData] = useState({
    inputSchema: '{}',
    outputSchema: '{}',
    metadata: '{}',
  });

  useEffect(() => {
    if (model) {
      setFormData({
        inputSchema: JSON.stringify(model.inputSchema || {}, null, 2),
        outputSchema: JSON.stringify(model.outputSchema || {}, null, 2),
        metadata: JSON.stringify(model.metadata || {}, null, 2),
      });
    }
  }, [model]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus('unsaved');
  };

  const handleSave = () => {
    setStatus('saving');
    try {
      const updateData = {
        inputSchema: JSON.parse(formData.inputSchema),
        outputSchema: JSON.parse(formData.outputSchema),
        metadata: JSON.parse(formData.metadata),
      };
      mutate(updateData);
    } catch (error) {
      toast('Invalid JSON format. Please check your input.');
      setStatus('unsaved');
    }
  };

  if (ConfigData.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Input Schema
        </Text>
        <Text variant="bodySm" color="subdued" className="mb-4">
          Define the expected input format and parameters for the model. Use
          JSON format.
        </Text>
        <FormLayout>
          <TextField
            name="inputSchema"
            label="Input Schema (JSON)"
            value={formData.inputSchema}
            onChange={(value) => handleInputChange('inputSchema', value)}
            multiline={10}
            helpText="Example: { 'prompt': 'string', 'max_tokens': 'number' }"
            monospaced
          />
        </FormLayout>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Output Schema
        </Text>
        <Text variant="bodySm" color="subdued" className="mb-4">
          Define the expected output format from the model. Use JSON format.
        </Text>
        <FormLayout>
          <TextField
            name="outputSchema"
            label="Output Schema (JSON)"
            value={formData.outputSchema}
            onChange={(value) => handleInputChange('outputSchema', value)}
            multiline={10}
            helpText="Example: { 'text': 'string', 'tokens_used': 'number' }"
            monospaced
          />
        </FormLayout>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Additional Metadata
        </Text>
        <Text variant="bodySm" color="subdued" className="mb-4">
          Store additional information about the model such as training data,
          limitations, use cases, etc.
        </Text>
        <FormLayout>
          <TextField
            name="metadata"
            label="Metadata (JSON)"
            value={formData.metadata}
            onChange={(value) => handleInputChange('metadata', value)}
            multiline={10}
            helpText="Example: { 'training_data': 'Description', 'limitations': ['List', 'of', 'limitations'] }"
            monospaced
          />
        </FormLayout>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} loading={updateLoading}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
