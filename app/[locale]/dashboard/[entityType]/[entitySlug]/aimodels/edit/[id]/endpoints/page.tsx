'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
    Button,
    DataTable,
    Dialog,
    FormLayout,
    Icon,
    IconButton,
    Select,
    Text,
    TextField,
    toast,
} from 'opub-ui';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';

const FetchModelEndpoints: any = graphql(`
  query ModelEndpoints($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      endpoints {
        id
        url
        httpMethod
        authType
        authHeaderName
        isPrimary
        isActive
        timeoutSeconds
        maxRetries
      }
    }
  }
`);

const CreateEndpointMutation: any = graphql(`
  mutation createEndpoint($input: CreateModelEndpointInput!) {
    createModelEndpoint(input: $input) {
      success
    }
  }
`);

const UpdateEndpointMutation: any = graphql(`
  mutation updateEndpoint($input: UpdateModelEndpointInput!) {
    updateModelEndpoint(input: $input) {
      success
    }
  }
`);

const DeleteEndpointMutation: any = graphql(`
  mutation deleteEndpoint($endpointId: Int!) {
    deleteModelEndpoint(endpointId: $endpointId) {
      success
    }
  }
`);

export default function EndpointsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any>(null);

  const EndpointsData: { data: any; isLoading: boolean; refetch: any } =
    useQuery(
      [`fetch_ModelEndpoints_${params.id}`],
      () =>
        GraphQL(
          FetchModelEndpoints,
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

  const endpoints = EndpointsData.data?.aiModels[0]?.endpoints || [];

  const { mutate: createEndpoint, isLoading: createLoading } = useMutation(
    (data: any) =>
      GraphQL(
        CreateEndpointMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            modelId: parseInt(params.id),
            ...data,
          },
        }
      ),
    {
      onSuccess: () => {
        toast('Endpoint created successfully');
        setIsModalOpen(false);
        EndpointsData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: updateEndpoint, isLoading: updateLoading } = useMutation(
    (data: any) =>
      GraphQL(
        UpdateEndpointMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: data,
        }
      ),
    {
      onSuccess: () => {
        toast('Endpoint updated successfully');
        setIsModalOpen(false);
        setEditingEndpoint(null);
        EndpointsData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: deleteEndpoint } = useMutation(
    (id: number) =>
      GraphQL(
        DeleteEndpointMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        { endpointId: id }
      ),
    {
      onSuccess: () => {
        toast('Endpoint deleted successfully');
        EndpointsData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const [formData, setFormData] = useState({
    url: '',
    httpMethod: 'POST',
    authType: 'BEARER',
    authHeaderName: 'Authorization',
    isPrimary: false,
    isActive: true,
    timeoutSeconds: 30,
    maxRetries: 3,
  });

  const handleOpenModal = (endpoint?: any) => {
    if (endpoint) {
      setEditingEndpoint(endpoint);
      setFormData({
        url: endpoint.url,
        httpMethod: endpoint.httpMethod,
        authType: endpoint.authType,
        authHeaderName: endpoint.authHeaderName,
        isPrimary: endpoint.isPrimary,
        isActive: endpoint.isActive,
        timeoutSeconds: endpoint.timeoutSeconds,
        maxRetries: endpoint.maxRetries,
      });
    } else {
      setEditingEndpoint(null);
      setFormData({
        url: '',
        httpMethod: 'POST',
        authType: 'BEARER',
        authHeaderName: 'Authorization',
        isPrimary: false,
        isActive: true,
        timeoutSeconds: 30,
        maxRetries: 3,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingEndpoint) {
      updateEndpoint({
        id: editingEndpoint.id,
        ...formData,
      });
    } else {
      createEndpoint(formData);
    }
  };

  const httpMethodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
  ];

  const authTypeOptions = [
    { label: 'Bearer Token', value: 'BEARER' },
    { label: 'API Key', value: 'API_KEY' },
    { label: 'Basic Auth', value: 'BASIC' },
    { label: 'OAuth 2.0', value: 'OAUTH2' },
    { label: 'Custom Headers', value: 'CUSTOM' },
    { label: 'No Authentication', value: 'NONE' },
  ];

  if (EndpointsData.isLoading) {
    return <div>Loading...</div>;
  }

  const endpointsColumns = [
    {
      accessorKey: 'url',
      header: 'URL',
      cell: ({ row }: any) => (
        <Text className="line-clamp-1 max-w-[300px]" title={row.original.url}>
          {row.original.url}
        </Text>
      ),
    },
    {
      accessorKey: 'httpMethod',
      header: 'Method',
      cell: ({ row }: any) => (
        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
          {row.original.httpMethod}
        </span>
      ),
    },
    {
      accessorKey: 'authType',
      header: 'Auth Type',
      cell: ({ row }: any) => (
        <span className="text-xs">{row.original.authType}</span>
      ),
    },
    {
      accessorKey: 'isPrimary',
      header: 'Primary',
      cell: ({ row }: any) =>
        row.original.isPrimary ? (
          <Icon source={Icons.check} size={16} color="success" />
        ) : null,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }: any) =>
        row.original.isActive ? (
          <Icon source={Icons.check} size={16} color="success" />
        ) : (
          <Icon source={Icons.cross} size={16} color="critical" />
        ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <IconButton
            size="medium"
            icon={Icons.pencil}
            onClick={() => handleOpenModal(row.original)}
          >
            Edit
          </IconButton>
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="critical"
            onClick={() => deleteEndpoint(row.original.id)}
          >
            Delete
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Text variant="headingMd" as="h2">
          API Endpoints
        </Text>
        <Button onClick={() => handleOpenModal()}>Add Endpoint</Button>
      </div>

      {endpoints.length > 0 ? (
        <DataTable
          columns={endpointsColumns}
          rows={endpoints}
          hideSelection
          hideViewSelector
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12">
          <Icon source={Icons.terminal} size={48} color="subdued" />
          <Text variant="headingSm" color="subdued" className="mt-4">
            No endpoints configured yet
          </Text>
          <Button onClick={() => handleOpenModal()} className="mt-4">
            Add Your First Endpoint
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
          <Dialog.Content
            title={editingEndpoint ? 'Edit Endpoint' : 'Add New Endpoint'}
          >
            <FormLayout>
            <TextField
              name="url"
              label="Endpoint URL"
              value={formData.url}
              onChange={(value) => setFormData({ ...formData, url: value })}
              placeholder="https://api.example.com/v1/chat/completions"
              required
            />
            <Select
              name="httpMethod"
              label="HTTP Method"
              options={httpMethodOptions}
              value={formData.httpMethod}
              onChange={(value) =>
                setFormData({ ...formData, httpMethod: value })
              }
            />
            <Select
              name="authType"
              label="Authentication Type"
              options={authTypeOptions}
              value={formData.authType}
              onChange={(value) => setFormData({ ...formData, authType: value })}
            />
            <TextField
              name="authHeaderName"
              label="Auth Header Name"
              value={formData.authHeaderName}
              onChange={(value) =>
                setFormData({ ...formData, authHeaderName: value })
              }
              helpText="Header name for authentication (e.g., Authorization, X-API-Key)"
            />
            <TextField
              name="timeoutSeconds"
              label="Timeout (seconds)"
              type="number"
              value={formData.timeoutSeconds.toString()}
              onChange={(value) =>
                setFormData({ ...formData, timeoutSeconds: parseInt(value) || 30 })
              }
            />
            <TextField
              name="maxRetries"
              label="Max Retries"
              type="number"
              value={formData.maxRetries.toString()}
              onChange={(value) =>
                setFormData({ ...formData, maxRetries: parseInt(value) || 3 })
              }
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span>Primary Endpoint</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span>Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <Button onClick={() => setIsModalOpen(false)} kind="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={createLoading || updateLoading}
              >
                {editingEndpoint ? 'Update' : 'Create'}
              </Button>
            </div>
            </FormLayout>
          </Dialog.Content>
        )}
      </Dialog>
    </div>
  );
}
