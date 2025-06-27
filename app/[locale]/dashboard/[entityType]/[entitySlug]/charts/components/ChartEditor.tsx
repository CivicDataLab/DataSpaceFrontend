import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  ResourceChartImageInput,
  ResourceChartInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  Dialog,
  DropZone,
  Form,
  Icon,
  Label,
  Select,
  Spinner,
  Tag,
  Text,
  toast,
  Tooltip,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
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

const createResourceChartVizDoc: any = graphql(`
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

const ChartsEditor = ({ setEditorView }: { setEditorView: any }) => {
  /*
    Chart creation View in Listing Page to create either the image or the visualization
  */

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
  allDatasetsRes: any;
  params: any;
}) => {
  const [files, setFiles] = useState<File | undefined>(undefined);

  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  const router = useRouter();

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
      onSuccess: (resp: any) => {
        toast(`Created chart image successfully`);
        // Navigate to chart image preview page
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/charts/${resp?.createResourceChartImage?.id}?type=TypeResourceChartImage`
        );
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const handleAddImage = () => {
    if (selectedDataset && files) {
      createResourceChartImageMutation.mutate({
        dataset: selectedDataset,
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

const ChartTypeDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedChartCategory, setSelectedChartCategory] = useState('');
  const [selectedChart, setSelectedChart] = useState('');

  const chartTypes = [
    {
      label: 'BAR HORIZONTAL',
      value: 'BAR_HORIZONTAL',
      image: '',
      category: 'BAR',
      categoryIcon: 'chartBar',
    },
    {
      label: 'BAR VERTICAL',
      value: 'BAR_VERTICAL',
      image: '',
      category: 'BAR',
      categoryIcon: 'chartBar',
    },
    {
      label: 'LINE',
      value: 'LINE',
      image: '',
      category: 'LINE',
      categoryIcon: 'chartLine',
    },
    {
      label: 'TREEMAP',
      value: 'TREEMAP',
      image: '',
      category: 'TREEMAP',
      categoryIcon: 'chartTreeMap',
    },
    {
      label: 'BIG NUMBER',
      value: 'BIG_NUMBER',
      image: '',
      category: 'BIG_NUMBER',
      categoryIcon: 'chartBigNumber',
    },
    {
      label: 'MAP',
      value: 'MAP',
      image: '',
      category: 'MAP',
      categoryIcon: 'chartMap',
    },
    {
      label: 'MAP POLYGON',
      value: 'MAP_POLYGON',
      image: '',
      category: 'MAP_POLYGON',
      categoryIcon: 'chartMapPolygon',
    },
  ];

  const categoriesArray = Array.from(
    new Map(
      chartTypes.map((item) => [
        item.category,
        { value: item.category, icon: item.categoryIcon },
      ])
    ).values()
  );

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {categoriesArray.map((category, index) => (
              <div
                key={index}
                className="border rounded-lg hover:bg-gray-50 flex cursor-pointer flex-row items-center gap-2 p-4"
                onClick={() => {
                  setSelectedChartCategory(category.value);
                }}
              >
                <Icon
                  source={Icons[category.icon]}
                  size={48}
                  className="var(--blue-primary-color)"
                />
                <Text variant="headingSm" className="text-center">
                  {category.value}
                </Text>
              </div>
            ))}
          </div>
        </Dialog.Trigger>
        <Dialog.Content title={'Chart Type'} large headerHidden>
          <div className="flex flex-col gap-4 p-14">
            <div className="flex flex-row gap-4">
              <div className="flex flex-col">
                <aside className="min-w-[240px]h-100 mb-10 overflow-hidden rounded-2 border-2 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-10 pt-4 shadow-insetBasic md:block">
                  {categoriesArray.map((category, index) => (
                    <div
                      key={`${index}_${category.value}`}
                      onClick={() => {
                        setSelectedChartCategory(category.value);
                      }}
                      className="mb-5 cursor-pointer"
                    >
                      <div className={cn('relative flex justify-between')}>
                        <span
                          className={cn(
                            'absolute left-0 top-0 h-full w-[3px] rounded-r-1 bg-transparent',
                            selectedChartCategory == category.value &&
                              'bg-borderWarningDefault'
                          )}
                        />
                        <div
                          className={cn(
                            'ml-2 flex  w-full items-center overflow-hidden rounded-1',
                            // styles.Item,
                            selectedChartCategory == category.value &&
                              'svg:text-primaryDefault bg-surfaceSelected'
                          )}
                        >
                          <Tooltip side="right" content={category.value}>
                            <div className="basis-5 px-3 py-2">
                              <Icon
                                source={Icons[category.icon]}
                                color={
                                  selectedChartCategory == category.value
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </div>
                          </Tooltip>
                          <div
                            className={cn(
                              'py-2 pr-3',
                              'whitespace-nowrap opacity-100 transition-opacity duration-300'
                            )}
                          >
                            <Text fontWeight="medium">
                              {category.value
                                .replaceAll('_', ' ')
                                .toUpperCase()}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </aside>
              </div>
              <div className="flex flex-grow flex-col">
                <div className="flex flex-row items-center justify-between">
                  <Text
                    variant="headingLg"
                    fontWeight="semibold"
                    className="text-center"
                  >
                    Select Chart Type
                  </Text>
                  <Button
                    kind="tertiary"
                    icon={
                      <Icon source={Icons.cross} size={24} color="warning" />
                    }
                    onClick={() => {}}
                  />
                </div>
                <div className="mt-10 grid grid-cols-3 gap-4">
                  {chartTypes
                    .filter((item) => item.category === selectedChartCategory)
                    .map((item) => (
                      <div
                        key={item.value}
                        className="flex cursor-pointer flex-col items-center gap-2"
                        onClick={() => {
                          setSelectedChart(item.value);
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.label}
                          width={160}
                          height={160}
                          className="border border-gray-200 rounded-2 border-2"
                        />
                        <Text>{item.label}</Text>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center gap-4">
              <Button
                onClick={() => {
                  setOpen(false);
                }}
              >
                Save and Close
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

const ChartCreateViz = ({
  allDatasetsRes,
  params,
}: {
  allDatasetsRes: any;
  params: any;
}) => {
  const [chartDataset, setChartDataset] = useState<any>('');
  const [chartResource, setChartResource] = useState<any>('');
  const [selectedChartType, setSelectedChartType] = useState<any>('');

  const router = useRouter();

  const createResourceChartVizMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
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
      onSuccess: (resp: any) => {
        toast(`Created chart successfully. Redirecting . . .`);
        // Navigate to chart preview page
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/charts/${resp?.createResourceChart?.id}?type=TypeResourceChart`
        );
      },
      onError: (err: any) => {
        console.error(err);

        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const chartTypes = [
    {
      label: 'BAR',
      value: 'BAR',
      icon: 'chartBar',
    },
    {
      label: 'LINE',
      value: 'LINE',
      icon: 'chartLine',
    },
    {
      label: 'TREEMAP',
      value: 'TREEMAP',
      icon: 'chartTreeMap',
    },
    {
      label: 'BIG NUMBER',
      value: 'BIG_NUMBER',
      icon: 'chartBigNumber',
    },
    {
      label: 'MAP',
      value: 'MAP',
      icon: 'chartMap',
    },
    {
      label: 'MAP POLYGON',
      value: 'MAP_POLYGON',
      icon: 'chartMapPolygon',
    },
  ];

  const handleChartCreateViz = () => {
    if (chartResource !== '' && selectedChartType !== '') {
      createResourceChartVizMutation.mutate({
        resource: chartResource,
        type: selectedChartType,
      });
    } else {
      toast('Please select a resource and chart type');
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
          <Select
            name={'chartCreateSelectDataset'}
            label="Select Dataset"
            options={allDatasetsRes?.data?.datasets?.map((item: any) => {
              return {
                label: item.title,
                value: item.id,
              };
            })}
            onChange={(e) => {
              setChartDataset(e);
              setChartResource('');
            }}
          />

          <Select
            name={'chartCreateSelectResource'}
            label="Select Resource"
            options={allDatasetsRes?.data?.datasets
              ?.find((item: any) => item.id === chartDataset)
              ?.resources?.map((item: any) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              })}
            onChange={(e) => {
              setChartResource(e);
            }}
            value={chartResource || ''}
          />
          <div>
            <Label>Select Chart type</Label>
            {/* <ChartTypeDialog /> */}
            <div className="mt-2 grid grid-cols-2 gap-4">
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
                      source={Icons[chartType.icon]}
                      size={48}
                      className="svg:text-primaryDefault"
                    />
                  }
                  onClick={() => {
                    setSelectedChartType(chartType.value);
                  }}
                >
                  {chartType.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button kind="primary" size="large" onClick={handleChartCreateViz}>
              Create Chart
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
