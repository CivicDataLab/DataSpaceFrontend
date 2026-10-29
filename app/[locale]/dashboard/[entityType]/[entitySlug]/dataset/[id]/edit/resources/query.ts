import { graphql } from '@/gql';

export const getResourceDoc = graphql(`
  query getResources($filters: DatasetFilter) {
    datasets(filters: $filters) {
      datasetType
      status
      resources {
        id
        dataset {
          pk
        }
        type
        name
        description
        created
        promptDetails {
          promptFormat
          hasSystemPrompt
          hasExampleResponses
        }
        fileDetails {
          id
          resource {
            pk
          }
          format
          file {
            name
            url
          }
          size
          created
          modified
        }
      }
    }
  }
`);

export const datasetPlatformSourceDoc = graphql(`
  query datasetPlatformSource($filters: DatasetFilter) {
    datasets(filters: $filters) {
      source {
        platform
        sourceUrl
      }
    }
  }
`);
