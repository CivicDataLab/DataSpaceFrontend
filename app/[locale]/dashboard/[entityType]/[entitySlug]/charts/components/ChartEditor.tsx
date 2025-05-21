import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { ResourceChartImageInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  DropZone,
  Form,
  Select,
  Spinner,
  Tag,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const getAllDatasetsListwithResourcesDoc: any = graphql(`
  query getAllDatasets {
    datasets {
      id
      title
      slug
      resources {
        id
        name
      }
    }
  }
`);

const createResourceChartImageDoc: any = graphql(`
  mutation createResourceChartImage($input: ResourceChartImageInput!) {
    createResourceChartImage(input: $input) {
      __typename
      ... on TypeResourceChartImage {
        name
        id
      }
    }
  }
`);

const ChartsEditor = ({ setEditorView }: { setEditorView: any }) => {
  const params = useParams<{ entityType: string; entitySlug: string }>();

  const allDatasetsRes: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery([`allDatasetsListwithResourcesForCharts`], () =>
    GraphQL(
      getAllDatasetsListwithResourcesDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      []
    )
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <Text variant="heading2xl">Charts Editor</Text>
        <Button
          icon={<Icons.cross />}
          kind="tertiary"
          className="font-color-secondaryOrange"
          onClick={() => setEditorView(false)}
        >
          Close Editor
        </Button>
      </div>
      <div className="py-4">
        <Text variant="bodyLg">
          Visual displays of information communicate complex data relationships
          and data-driven insights in a way that is easy to understand. You can
          create a Chart using our in-built chart generator, or Upload an Image.
        </Text>
      </div>

      {allDatasetsRes.isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex w-full flex-row gap-4">
          <ChartCreate allDatasetsRes={allDatasetsRes} params={params} />
          <ChartImageUpload allDatasetsRes={allDatasetsRes} params={params} />
        </div>
      )}
    </div>
  );
};

export default ChartsEditor;

const ChartImageUpload = ({
  allDatasetsRes,
  params,
}: {
  allDatasetsRes: any;
  params: any;
}) => {
  const [files, setFiles] = useState<File | undefined>(undefined);

  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  const createResourceChartImageMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`createResourceChartImage`],
    (input: ResourceChartImageInput) =>
      GraphQL(
        createResourceChartImageDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { input: input }
      ),
    {
      onSuccess: () => {
        toast(`Created chart image successfully`);
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const handleAddImage = () => {
    console.log('Add Image :::', selectedDataset, files);
    if (selectedDataset && files) {
      createResourceChartImageMutation.mutate({
        dataset: { set: selectedDataset },
        image: files,
      });
    }
  };

  return (
    <div className="border border-gray-200 flex w-full flex-col justify-between gap-4 rounded-4 bg-basePureWhite p-5 shadow-card">
      <div className="flex items-center justify-center gap-3">
        <Icons.photo size={48} color="var(--blue-primary-color)" />
        <Text variant="headingLg" fontWeight="semibold">
          IMAGE
        </Text>
      </div>

      <Form>
        <div className="flex flex-col gap-4">
          <Combobox
            label="Select Dataset"
            name="selectDataset"
            list={allDatasetsRes?.data?.datasets?.map((item: any) => {
              return {
                label: item.title,
                value: item.id,
              };
            })}
            displaySelected
            // selectedValue={selectedDataset}
            onChange={(e) => {
              setSelectedDataset(e);
            }}
            required
          />

          <DropZone
            name={'chartImage'}
            label="Select Chart Image"
            accept=".png,.jpg,.jpeg,.svg,.tiff"
            onDrop={(val) => {
              console.log('drop ::', val);
              setFiles(val[0]);
            }}
            outline
            allowMultiple={false}
            className="bg-greyExtralight"
            errorOverlayText={files ? undefined : 'Please select a file'}
            required
          >
            {files ? (
              <div className="mt-4 flex items-center justify-between">
                <Text variant="bodyMd" color="subdued">
                  {files.name}
                </Text>
                <Button
                  icon={<Icons.delete />}
                  kind="tertiary"
                  onClick={() => setFiles(undefined)}
                />
              </div>
            ) : (
              <DropZone.FileUpload
                actionHint={
                  <div className="flex flex-col items-center gap-2 p-2">
                    <Text variant="bodyMd" color="subdued">
                      Drag and drop
                    </Text>
                    <div className="font-color-textDefault w-fit rounded-1 bg-tertiaryAccent px-2 py-1">
                      Select File
                    </div>
                    <Text variant="bodyMd" color="subdued">
                      *only one image can be added.
                    </Text>
                    <Text variant="bodyMd" color="subdued">
                      Recommended resolution of 16:9 - (1280x720), (1920x1080)
                    </Text>
                    <Text variant="bodyMd" color="subdued">
                      Maximum file size: 100MB
                    </Text>
                    <div className="flex flex-row items-center gap-2">
                      <Text variant="bodyMd" color="subdued">
                        Supported File Types:
                      </Text>
                      <div className="flex flex-row gap-1">
                        {['PNG', 'JPG', 'SVG', 'TIFF'].map((item, index) => (
                          <Tag
                            fillColor="white"
                            textColor="baseDefault"
                            key={index}
                          >
                            {item}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                }
                actionTitle={''}
              />
            )}
          </DropZone>

          <div className="flex items-center justify-center">
            <Button kind="primary" size="large" onClick={handleAddImage}>
              Add Image
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

const ChartCreate = ({
  allDatasetsRes,
  params,
}: {
  allDatasetsRes: any;
  params: any;
}) => {
  return (
    <div className="border border-gray-200 flex w-full flex-col justify-between rounded-4 bg-basePureWhite p-5 shadow-card">
      <div className="flex items-center justify-center gap-3">
        <Icons.chart size={48} color="var(--blue-primary-color)" />
        <Text variant="headingLg" fontWeight="semibold">
          CHART
        </Text>
      </div>

      <Form>
        <div className="flex flex-col gap-4">
          <Select
            disabled
            name={'chartCreateSelectDataset'}
            label="Select Dataset"
            options={allDatasetsRes?.data?.datasets?.map((item: any) => {
              return {
                label: item.title,
                value: item.id,
              };
            })}
          />

          <div className="flex items-center justify-center">
            <Button kind="primary" size="large">
              Create Chart
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
