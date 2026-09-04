import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { ResourceChartImageInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Divider,
  DropZone,
  Icon,
  Sheet,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';

interface ImageProps {
  setType: (type: string) => void;
  setImageId: (id: string) => void;
  imageId: string | null;
}

interface ChartImageListItem {
  id: string;
  name: string;
}

interface ChartImageFormData {
  id: string;
  name: string;
  description: string;
  image: { name: string; path: string } | null;
}

const getResourceChartImageDetails = graphql(`
  query resourceChartImage($filters: ResourceChartImageFilter) {
    resourceChartImages(filters: $filters) {
      id
      name
      description
      image {
        name
        path
      }
    }
  }
`);

const getDatasetResourceChartImageDetails = graphql(`
  query resourceChartImages($datasetId: UUID!) {
    datasetResourceCharts(datasetId: $datasetId) {
      id
      name
      description
      image {
        name
        path
      }
    }
  }
`);

const AddResourceChartimage = graphql(`
  mutation GenerateResourceChartimage($dataset: UUID!) {
    addResourceChartImage(dataset: $dataset) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
      }
    }
  }
`);

const UpdateChartImageMutation = graphql(`
  mutation updateChartImage($input: ResourceChartImageInputPartial!) {
    updateResourceChartImage(input: $input) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
        description
        image {
          name
          path
        }
      }
    }
  }
`);

const ChartsImage: React.FC<ImageProps> = ({
  setType,
  setImageId,
  imageId,
}) => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { data: chartImageDetails, refetch } = useQuery(
      [`chartsdata_${params.id}`, imageId],
      () =>
        GraphQL(
          getResourceChartImageDetails,
          {
            [params.entityType]: params.entitySlug,
          },
          {
            filters: {
              id: imageId,
            },
          }
        ),
      {}
    );

  const { data: chartImagesList, refetch: listrefetch } = useQuery(
    [`chartslist_${params.id}`, imageId],
    () =>
      GraphQL(
        getDatasetResourceChartImageDetails,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          datasetId: params.id,
        }
      ),
    {}
  );

  const resourceChartImageMutation = useMutation(
    (data: { dataset: string }) =>
      GraphQL(
        AddResourceChartimage,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        toast('Resource ChartImage Created Successfully');
        setType('img');
        const created = res?.addResourceChartImage;
        if (created?.__typename === 'TypeResourceChartImage' && created.id) {
          setImageId(created.id);
        }
        setIsSheetOpen(false);
      },
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while deleting chart `);
      },
    }
  );

  const initialFormData: ChartImageFormData = {
    id: '',
    name: '',
    description: '',
    image: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [previousFormData, setPreviousFormData] = useState(initialFormData);
  const [prevChartImageDetails, setPrevChartImageDetails] =
    useState(chartImageDetails);
  if (chartImageDetails !== prevChartImageDetails) {
    setPrevChartImageDetails(chartImageDetails);
    if (chartImageDetails?.resourceChartImages?.[0]) {
      const imageDetails = chartImageDetails.resourceChartImages[0];
      const updatedData: ChartImageFormData = {
        name: imageDetails.name || '',
        description: imageDetails.description || '',
        image: imageDetails.image
          ? {
              name: imageDetails.image.name ?? '',
              path: imageDetails.image.path ?? '',
            }
          : null,
        id: imageDetails.id ?? '',
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { isLoading: editMutationLoading } = useMutation(
    (data: { input: ResourceChartImageInputPartial }) =>
      GraphQL(
        UpdateChartImageMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        toast('ChartImage updated successfully');
        refetch();
        listrefetch();
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        toast(`Error: ${message}`);
      },
    }
  );

  const handleChange = useCallback(
    (field: keyof ChartImageFormData, value: ChartImageFormData[keyof ChartImageFormData]) => {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    },
    [setFormData]
  );

  const onDrop = useCallback(() => {
    refetch();
    listrefetch();
  }, [listrefetch, refetch]);

  const handleSave = (updatedData: ChartImageFormData) => {
    if (JSON.stringify(formData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);
    }
  };

  return (
    <>
      {!imageId ? (
        <Loading />
      ) : (
        <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
            <Button
              onClick={() => {
                setType('list');
                setImageId('');
              }}
              kind="tertiary"
              className="flex text-start"
            >
              <span className="flex items-center gap-2">
                <Icon source={Icons.back} color="interactive" size={24} />
                <Text color="interactive">Charts Listing</Text>
              </span>
            </Button>
            <Sheet open={isSheetOpen}>
              <Sheet.Trigger>
                <Button onClick={() => setIsSheetOpen(true)}>
                  Select ChartImage
                </Button>
              </Sheet.Trigger>
              <Sheet.Content side="bottom">
                <div className=" flex  flex-col gap-6 p-10">
                  <div className="flex items-center justify-between">
                    <Text variant="bodyLg">Select Charts</Text>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() =>
                          resourceChartImageMutation.mutate({
                            dataset: params.id,
                          })
                        }
                      >
                        Add Image
                      </Button>
                      <Button
                        kind="tertiary"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Icon source={Icons.cross} size={24} />
                      </Button>
                    </div>
                  </div>
                  {chartImagesList?.datasetResourceCharts?.map(
                    (item: ChartImageListItem, index: number) => (
                      <div
                        key={index}
                        className={`rounded-1 border-1 border-solid border-baseGraySlateSolid6 px-6 py-3 ${imageId === item.id ? ' bg-baseGraySlateSolid5' : ''}`}
                      >
                        <Button
                          kind={'tertiary'}
                          className="flex w-full justify-start"
                          disabled={imageId === item.id}
                          onClick={() => {
                            setImageId(item.id);
                            setIsSheetOpen(false);
                          }}
                        >
                          {item.name}
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </Sheet.Content>
            </Sheet>
          </div>
          <Divider />
          <div className="mt-8 flex justify-end gap-2">
            <Text color="highlight">Auto Save </Text>
            {editMutationLoading ? (
              <Spinner />
            ) : (
              <Icon source={Icons.checkmark} />
            )}
          </div>
          <div className="mt-4 flex w-full flex-wrap gap-8">
            <div className="flex w-full flex-col gap-8 ">
              <TextField
                label="Title"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e)}
                onBlur={() => handleSave(formData)}
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                multiline={4}
                onChange={(e) => handleChange('description', e)}
                onBlur={() => handleSave(formData)}
              />
              <DropZone
                label={
                  !chartImageDetails?.resourceChartImages?.[0]?.image
                    ? 'Logo'
                    : 'Change Logo'
                }
                onDrop={onDrop}
                name={'Logo'}
              >
                <DropZone.FileUpload
                  actionHint="Accepts .gif, .jpg, and .png"
                  actionTitle={
                    chartImageDetails &&
                    chartImageDetails.resourceChartImages?.[0]?.image?.name
                      ?.split('/')
                      .pop()
                  }
                />
              </DropZone>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartsImage;
