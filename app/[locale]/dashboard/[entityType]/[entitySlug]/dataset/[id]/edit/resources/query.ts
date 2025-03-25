import { graphql } from '@/gql';

export const getReourceDoc = graphql(`
  query getResources($filters: DatasetFilter) {
    datasets(filters: $filters) {
      resources {
        id
        dataset {
          pk
        }
        previewData {
          columns
          rows
        }
        previewDetails {
          endEntry
          isAllEntries
          startEntry
        }
        previewEnabled
        schema {
          id
          fieldName
          format
          description
        }
        type
        name
        description
        created
        fileDetails {
          id
          resource {
            pk
          }
          file {
            name
            path
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
