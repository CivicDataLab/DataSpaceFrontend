import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  ChartTypes,
  ResourceChartImageInput,
  ResourceChartInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  DropZone,
  Form,
  Icon,
  Labelled,
  Select,
  Spinner,
  Tag,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

const getAllDatasetsListwithResourcesDoc = graphql(`
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

const createResourceChartImageDoc = graphql(`
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

const createResourceChartVizDoc = graphql(`
  mutation createResourceChart($chartInput: ResourceChartInput!) {
    createResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        name
        id
      }
    }
  }
`);

interface ChartEditorParams {
  entityType: string;
  entitySlug: string;
}

interface DatasetResource {
  id: string;
  name: string;
}

interface DatasetWithResources {
  id: string;
  title: string;
  slug?: string;
  resources: DatasetResource[];
}

interface AllDatasetsQueryResult {
  data?: {
    datasets?: DatasetWithResources[];
  };
  isLoading: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

const ChartsEditor = ({
  setEditorView,
}: {
  setEditorView: (view: boolean) => void;
}) => {
  /*
    Chart creation View in Listing Page to create either the image or the visualization
  */

  const params = useParams<{ entityType: string; entitySlug: string }>();

  const allDatasetsRes = useQuery(
    [`allDatasetsListwithResourcesForCharts`],
    () =>
      GraphQL(getAllDatasetsListwithResourcesDoc, {
        [params.entityType]: params.entitySlug,
      })
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <Text variant="heading2xl">Charts Editor</Text>
        <Button
          kind="tertiary"
          className="font-color-secondaryOrange"
          onClick={() => setEditorView(false)}
        >
          <span className="flex flex-wrap items-center gap-2 text-secondaryOrange lg:flex-nowrap">
            Close Editor <Icon source={Icons.cross} size={16} color="warning" />
          </span>
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
          <ChartCreateViz allDatasetsRes={allDatasetsRes} params={params} />
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
  allDatasetsRes: AllDatasetsQueryResult;
  params: ChartEditorParams;
}) => {
  const [files, setFiles] = useState<File | undefined>(undefined);

  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const router = useRouter();

  const createResourceChartImageMutation = useMutation(
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
      onSuccess: (resp) => {
        toast(`Created chart image successfully`);
        const created = resp.createResourceChartImage;
        const createdId = created && 'id' in created ? created.id : undefined;
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/charts/${createdId}?type=TypeResourceChartImage`
        );
      },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        toast('Error:  ' + message.split(':')[0]);
      },
    }
  );

  const handleAddImage = () => {
    if (selectedDataset && files) {
      createResourceChartImageMutation.mutate({
        dataset: selectedDataset,
        image: files,
      });
    } else {
      toast('Required fields missing. Please fill all required fields.');
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
          <Labelled label="Select Dataset" requiredIndicator>
            <Combobox
              label=""
              name="selectDataset"
              list={
                allDatasetsRes?.data?.datasets?.map((item) => {
                  const option: SelectOption = {
                    label: item.title,
                    value: item.id,
                  };
                  return option;
                }) ?? []
              }
              displaySelected
              // selectedValue={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e);
              }}
              required
              requiredIndicator={true}
            />
          </Labelled>

          <Labelled label="Select Chart Image" requiredIndicator>
            <DropZone
              name={'chartImage'}
              label=""
              accept=".png,.jpg,.jpeg,.svg,.tiff"
              onDrop={(val) => {
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
          </Labelled>

          <div className="flex items-center justify-center">
            <Button
              kind="primary"
              size="large"
              onClick={handleAddImage}
              disabled={createResourceChartImageMutation.isLoading}
            >
              Add Image
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

const ChartCreateViz = ({
  allDatasetsRes,
  params,
}: {
  allDatasetsRes: AllDatasetsQueryResult;
  params: ChartEditorParams;
}) => {
  const [chartDataset, setChartDataset] = useState('');
  const [chartResource, setChartResource] = useState('');
  const [selectedChartType, setSelectedChartType] = useState('');

  const router = useRouter();

  const createResourceChartVizMutation = useMutation(
    [`createResourceChart`],
    (chartInput: ResourceChartInput) =>
      GraphQL(
        createResourceChartVizDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { chartInput: chartInput }
      ),
    {
      onSuccess: (resp) => {
        toast(`Created chart successfully. Redirecting . . .`);
        const created = resp.createResourceChart;
        const createdId = created && 'id' in created ? created.id : undefined;
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/charts/${createdId}?type=TypeResourceChart`
        );
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast('Error:  ' + message.split(':')[0]);
      },
    }
  );

  const chartTypes = [
    {
      label: 'BAR',
      value: 'BAR',
      icon: 'chartBar',
      disabled: false,
    },
    {
      label: 'LINE',
      value: 'LINE',
      icon: 'chartLine',
      disabled: false,
    },
    {
      label: 'TREEMAP',
      value: 'TREEMAP',
      icon: 'chartTreeMap',
      disabled: false,
    },
    {
      label: 'BIG NUMBER',
      value: 'BIG_NUMBER',
      icon: 'chartBigNumber',
      disabled: true,
    },
    {
      label: 'MAP',
      value: 'MAP',
      icon: 'chartMap',
      disabled: true,
    },
    {
      label: 'MAP POLYGON',
      value: 'MAP_POLYGON',
      icon: 'chartMapPolygon',
      disabled: true,
    },
  ];

  const handleChartCreateViz = () => {
    if (chartResource !== '' && selectedChartType !== '') {
      createResourceChartVizMutation.mutate({
        resource: chartResource,
        type: selectedChartType as ChartTypes,
      });
    } else {
      toast('Required fields missing. Please fill all required fields.');
    }
  };

  return (
    <div className="border border-gray-200 flex w-full flex-col gap-4 rounded-4 bg-basePureWhite p-5 shadow-card">
      <div className="flex items-center justify-center gap-3">
        <Icons.chartBar size={48} color="var(--blue-primary-color)" />
        <Text variant="headingLg" fontWeight="semibold">
          CHART
        </Text>
      </div>
      <Form>
        <div className="flex flex-col gap-4">
          <Labelled label="Select Dataset" requiredIndicator>
            <Select
              name={'chartCreateSelectDataset'}
              label=""
              options={
                allDatasetsRes?.data?.datasets?.map((item) => {
                  const option: SelectOption = {
                    label: item.title,
                    value: item.id,
                  };
                  return option;
                }) ?? []
              }
              required
              requiredIndicator={true}
              onChange={(e) => {
                setChartDataset(e);
                setChartResource('');
              }}
            />
          </Labelled>

          <Labelled label="Select Resource" requiredIndicator>
            <Select
              name={'chartCreateSelectResource'}
              label=""
              required
              requiredIndicator={true}
              options={
                allDatasetsRes?.data?.datasets
                  ?.find((item) => item.id === chartDataset)
                  ?.resources?.map((item) => {
                    const option: SelectOption = {
                      label: item.name,
                      value: item.id,
                    };
                    return option;
                  }) ?? []
              }
              onChange={(e) => {
                setChartResource(e);
              }}
              value={chartResource || ''}
            />
          </Labelled>

          <div>
            <Labelled label="Select Chart type" requiredIndicator>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {chartTypes.map((chartType, index) => (
                  <Button
                    key={index}
                    kind="tertiary"
                    className={cn(
                      'border rounded-lg hover:bg-gray-50 flex cursor-pointer flex-row items-center justify-start gap-2 px-1 py-2',
                      selectedChartType === chartType.value &&
                        'bg-greyExtralight hover:bg-greyExtralight'
                    )}
                    icon={
                      <Icon
                        source={
                          chartType.icon in Icons
                            ? Icons[chartType.icon as keyof typeof Icons]
                            : Icons.chartBar
                        }
                        size={48}
                        className="svg:text-primaryDefault"
                      />
                    }
                    onClick={() => {
                      setSelectedChartType(chartType.value);
                    }}
                    disabled={chartType.disabled || false}
                  >
                    {chartType.label}
                  </Button>
                ))}
              </div>
            </Labelled>

            {/* <ChartTypeDialog /> */}
          </div>

          <div className="flex items-center justify-center">
            <Button
              kind="primary"
              size="large"
              onClick={handleChartCreateViz}
              disabled={createResourceChartVizMutation.isLoading}
            >
              Create Chart
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
