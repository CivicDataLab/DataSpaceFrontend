import { graphql } from '@/gql';

export const datasetQuery = graphql(`
  query getDataset($datasetId: UUID, $publicId: String) {
    getDataset(datasetId: $datasetId, publicId: $publicId) {
      id
      urlSlug
      title
      description
      downloadCount
      created
      modified
      isIndividualDataset
      license
      formats
      user {
        fullName
        id
        bio
        location
        profilePicture {
          url
        }
      }
      tags {
        id
        value
      }
      accessType
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        value
      }
      source {
        sourceHomepage
        sourceUrl
        platform
      }
      resources {
        id
        noOfEntries
      }
      organization {
        name
        description
        location
        logo {
          url
        }
        slug
        id
      }
      sectors {
        name
      }
      geographies {
        name
      }
    }
  }
`);
