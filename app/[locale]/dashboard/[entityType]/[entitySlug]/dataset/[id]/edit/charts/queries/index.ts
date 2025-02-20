import { graphql } from '@/gql';

export const datasetResource = graphql(`
  query allresources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      type
      name
      description
      schema {
        fieldName
        id
        format
      }
    }
  }
`);

export const chartDetailsQuery = graphql(`
  query chartsDetails($datasetId: UUID!) {
    chartsDetails(datasetId: $datasetId) {
      id
      name
      chartType
    }
  }
`);

export const getResourceChartDetails = graphql(`
  query resourceChart($chartDetailsId: UUID!) {
    resourceChart(chartDetailsId: $chartDetailsId) {
      chartType
      description
      id
      name
      resource {
        id
      }
      chart
      options {
        aggregateType
        xAxisColumn {
          id
          fieldName
        }
        yAxisColumn {
          field {
            id
            fieldName
          }
          label
          color
        }
        showLegend
        xAxisLabel
        yAxisLabel
        regionColumn {
          id
          fieldName
        }
        valueColumn {
          id
          fieldName
        }
      }
    }
  }
`);

export const createChart = graphql(`
  mutation editResourceChart($chartInput: ResourceChartInput!) {
    editResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        chartType
        description
        id
        resource {
          id
          name
        }
        name
        options {
          aggregateType
          xAxisColumn {
            id
            fieldName
          }
          yAxisColumn {
            field {
              id
              fieldName
            }
            label
            color
          }
          showLegend
          xAxisLabel
          yAxisLabel
          regionColumn {
            id
            fieldName
          }
          valueColumn {
            id
            fieldName
          }
        }
        chart
      }
    }
  }
`);



export const CreateResourceChart: any = graphql(`
  mutation GenerateResourceChart($resource: UUID!) {
    addResourceChart(resource: $resource) {
      __typename
      ... on TypeResourceChart {
        id
        name
      }
    }
  }
`);
