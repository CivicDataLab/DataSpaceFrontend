import { graphql } from '@/gql';

export const chartWizardDatasetsDoc = graphql(`
  query ChartWizardDatasets {
    datasets {
      id
      title
      geographies {
        name
      }
      resources {
        id
        name
      }
    }
  }
`);

export const chartWizardSchemaDoc = graphql(`
  query ChartWizardSchema($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      name
      schema {
        fieldName
        id
        format
      }
    }
  }
`);

export const chartWizardDetailsDoc = graphql(`
  query ChartWizardDetails($chartDetailsId: UUID!) {
    resourceChart(chartDetailsId: $chartDetailsId) {
      id
      name
      chartType
      status
      chart {
        options
      }
      dataset {
        id
        title
      }
      resource {
        id
        name
        schema {
          fieldName
          id
          format
        }
      }
      chartOptions {
        aggregateType
        orientation
        stacked
        showLegend
        xAxisLabel
        yAxisLabel
        label
        valuePrefix
        valueSuffix
        xAxisColumn {
          id
          fieldName
        }
        yAxisColumn {
          color
          label
          field {
            id
            fieldName
          }
        }
        regionColumn {
          id
          fieldName
        }
        valueColumn {
          id
          fieldName
        }
        latField {
          id
          fieldName
        }
        lngField {
          id
          fieldName
        }
        polygonField {
          id
          fieldName
        }
        geospatialField {
          id
          fieldName
        }
        nameField {
          id
          fieldName
        }
      }
    }
  }
`);

export const chartWizardCreateDoc = graphql(`
  mutation ChartWizardCreate($chartInput: ResourceChartInput!) {
    createResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        id
        name
      }
    }
  }
`);

export const chartWizardSaveDoc = graphql(`
  mutation ChartWizardSave($chartInput: ResourceChartInput!) {
    editResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        id
        name
        chart {
          options
        }
      }
    }
  }
`);

export const chartWizardPublishDoc = graphql(`
  mutation ChartWizardPublish($chartId: UUID!) {
    publishResourceChart(chartId: $chartId)
  }
`);

export const chartImageDetailsDoc = graphql(`
  query ChartImageWizardDetails($imageId: UUID!) {
    resourceChartImage(imageId: $imageId) {
      id
      name
      status
      dataset {
        id
        title
      }
      image {
        name
        url
      }
    }
  }
`);

export const chartImageCreateDoc = graphql(`
  mutation ChartImageWizardCreate($input: ResourceChartImageInput!) {
    createResourceChartImage(input: $input) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
      }
    }
  }
`);

export const chartImageUpdateDoc = graphql(`
  mutation ChartImageWizardUpdate($input: ResourceChartImageInputPartial!) {
    updateResourceChartImage(input: $input) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
      }
    }
  }
`);

export const chartImagePublishDoc = graphql(`
  mutation ChartImageWizardPublish($resourceChartImageId: UUID!) {
    publishResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);
