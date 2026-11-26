import { graphql } from '@/gql';

export const publicationMetaQuery = graphql(`
  query PublicationInfo($publicId: String!) {
    getPublication(publicId: $publicId) {
      title
      description
      urlSlug
      sectors {
        name
      }
    }
  }
`);

export const publicationLegacyMetaQuery = graphql(`
  query PublicationLegacyInfo($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      urlSlug
    }
  }
`);

export const publicationDetailsQuery = graphql(`
  query PublicationDetails($publicId: String!) {
    getPublication(publicId: $publicId) {
      id
      urlSlug
      status
      title
      description
      contributors {
        id
        fullName
      }
      publicationDate
      created
      license
      externalSourceLink
      isIndividualPublication
      resourceType {
        name
        slug
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      organization {
        id
        name
        slug
        logo {
          url
        }
      }
      user {
        id
        fullName
        profilePicture {
          url
        }
      }
      blocks {
        id
        position
        blockType
        title
        description
        fileName
        fileFormat
        fileSize
        youtubeUrl
        youtubeVideoId
      }
    }
  }
`);
