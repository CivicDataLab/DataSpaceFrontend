import { graphql } from '@/gql';

export const getResourceDoc = graphql(`
  query getResources($filters: DatasetFilter) {
    datasets(filters: $filters) {
      resources {
        id
        dataset {
          pk
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
