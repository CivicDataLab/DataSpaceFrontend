'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation } from '@tanstack/react-query';
import { Button, Icon, Text, toast } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const createDatasetMutationDoc: any = graphql(`
  mutation Generate_Dataset_Name {
    addDataset {
      success
      errors {
        fieldErrors {
          messages
        }
      }
      data {
        id
        title
        created
      }
    }
  }
`);
export const Content = () => {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;

  const isValidParams =
    typeof entityType === 'string' && typeof entitySlug === 'string';

  const ownerArgs: Record<string, string> | null = isValidParams
    ? { [entityType]: entitySlug }
    : null;

  const CreateDatasetMutation: { mutate: any; isLoading: boolean; error: any } =
    useMutation(() => GraphQL(createDatasetMutationDoc, ownerArgs || {}, []), {
      onSuccess: (data: any) => {
        if (data.addDataset.success) {
          toast('Dataset created successfully!');
          if (isValidParams && entityType && entitySlug) {
            router.push(
              `/dashboard/${entityType}/${entitySlug}/dataset/${data?.addDataset?.data?.id}/edit/metadata`
            );
          }
        } else {
          toast('Error: ' + data.addDataset.errors.fieldErrors[0].messages[0]);
        }
      },
    });

  if (!isValidParams) {
    return null;
  }

  return (
    <div className="flex h-full w-full grow flex-col items-center justify-center">
      <div className={twMerge('h-100 flex flex-col items-center gap-4')}>
        <Icon
          source={Icons.addDataset}
          color="interactive"
          stroke={1}
          size={80}
        />
        <Text variant="headingSm" color="subdued">
          You have not added any datasets yet.
        </Text>
        <Button onClick={() => CreateDatasetMutation.mutate()}>
          Add New Dataset
        </Button>
      </div>
    </div>
  );
};
