import { graphql } from '@/gql';

export const UpdateCollaborativeMutation = graphql(`
  mutation updateCollaborative($data: CollaborativeInputPartial!) {
    updateCollaborative(data: $data) {
      __typename
      id
      title
      summary
      created
      modified
      slug
      status
      startedOn
      completedOn
      platformUrl
      logo {
        name
        path
        url
      }
      coverImage {
        name
        path
        url
      }
    }
  }
`);

export const FetchCollaborative = graphql(`
  query CollaborativeData($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      summary
      platformUrl
      logo {
        name
        path
        url
      }
      coverImage {
        name
        path
        url
      }
      status
      slug
      startedOn
      completedOn
    }
  }
`);

export const UpdateCollaborativeTitleMutation = graphql(`
  mutation updateCollaborativeTitle($data: CollaborativeInputPartial!) {
    updateCollaborative(data: $data) {
      __typename
      id
      title
    }
  }
`);

export const FetchCollaborativeTitle = graphql(`
  query CollaborativeTitle($pk: ID!) {
    collaborative(pk: $pk) {
      id
      title
    }
  }
`);

export const FetchCollaborativeMetadata = graphql(`
  query CollaborativeMetadata($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      sdgs {
        id
        code
        name
        number
      }
      geographies {
        id
        name
        code
        type
      }
    }
  }
`);

export const metadataQueryDoc = graphql(`
  query CollaborativeMetaDataList($filters: MetadataFilter) {
    metadata(filters: $filters) {
      id
      label
      dataStandard
      urn
      dataType
      options
      filterable
    }
  }
`);

export const sectorsListQueryDoc = graphql(`
  query SectorList {
    sectors {
      id
      name
    }
  }
`);

export const sdgsListQueryDoc = graphql(`
  query SDGList {
    sdgs {
      id
      code
      name
      number
    }
  }
`);

export const tagsListQueryDoc = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

export const geographiesListQueryDoc = graphql(`
  query GeographiesList {
    geographies {
      id
      name
      code
      type
      parentId {
        id
        name
      }
    }
  }
`);

export const UpdateCollaborativeMetadata = graphql(`
  mutation addUpdateCollaborativeMetadata($updateMetadataInput: UpdateCollaborativeMetadataInput!) {
    addUpdateCollaborativeMetadata(updateMetadataInput: $updateMetadataInput) {
      __typename
      ... on TypeCollaborative {
        id
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
        tags {
          id
          value
        }
        sectors {
          id
          name
        }
        sdgs {
          id
          code
          name
          number
        }
        geographies {
          id
          name
          code
          type
        }
      }
    }
  }
`);

export const FetchCollaborativeDatasets = graphql(`
  query CollaborativeDetails($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      datasets {
        id
        title
        modified
        sectors {
          name
        }
      }
    }
  }
`);

export const AssignCollaborativeDatasets = graphql(`
  mutation assignCollaborativeDatasets($collaborativeId: String!, $datasetIds: [UUID!]!) {
    updateCollaborativeDatasets(collaborativeId: $collaborativeId, datasetIds: $datasetIds) {
      ... on TypeCollaborative {
        id
        datasets {
          id
          title
        }
      }
    }
  }
`);

export const FetchCollaborativeUseCases = graphql(`
  query CollaborativeUseCaseDetails($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      useCases {
        id
        title
        slug
        modified
        sectors {
          name
        }
      }
    }
  }
`);

export const AssignCollaborativeUseCases = graphql(`
  mutation assignCollaborativeUseCases($collaborativeId: String!, $useCaseIds: [String!]!) {
    updateCollaborativeUseCases(collaborativeId: $collaborativeId, useCaseIds: $useCaseIds) {
      ... on TypeCollaborative {
        id
        useCases {
          id
          title
        }
      }
    }
  }
`);

export const FetchCollaborativeReview = graphql(`
  query CollabDetails($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      summary
      website
      platformUrl
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      sectors {
        id
        name
      }
      sdgs {
        id
        code
        name
      }
      tags {
        id
        value
      }
      startedOn
      completedOn
      logo {
        name
        path
        url
      }
      coverImage {
        name
        path
        url
      }
      datasets {
        title
        id
        description
        status
        sectors {
          name
        }
        modified
      }
      useCases {
        title
        id
        slug
        sectors {
          name
        }
        modified
      }
      contactEmail
      status
      slug
      contributors {
        id
        fullName
        username
        profilePicture {
          url
        }
      }
      supportingOrganizations {
        id
        name
        logo {
          url
          name
        }
      }
      partnerOrganizations {
        id
        name
        logo {
          url
          name
        }
      }
    }
  }
`);

export const publishCollaborativeMutation = graphql(`
  mutation publishCollaborative($collaborativeId: String!) {
    publishCollaborative(collaborativeId: $collaborativeId) {
      ... on TypeCollaborative {
        id
        status
      }
    }
  }
`);

