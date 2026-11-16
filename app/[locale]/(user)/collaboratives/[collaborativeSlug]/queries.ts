import { graphql } from '@/gql';

export const collaborativeMetaQuery = graphql(`
  query PublicCollaborativeInfo($slug: String, $publicId: String) {
    collaborativeBySlug(slug: $slug, publicId: $publicId) {
      title
      summary
      slug
      tags {
        id
        value
      }
    }
  }
`);

export const collaborativeDetailsQuery = graphql(`
  query PublicCollaborativeDetails($slug: String, $publicId: String) {
    collaborativeBySlug(slug: $slug, publicId: $publicId) {
      id
      title
      summary
      slug
      modified
      platformUrl
      contactEmail
      coverImage {
        url
      }
      logo {
        url
      }
      tags {
        id
        value
      }
      sdgs {
        id
        code
        name
        number
        description
      }
      geographies {
        id
        name
      }
      contributors {
        id
        fullName
        profilePicture {
          url
        }
      }
      supportingOrganizations {
        id
        slug
        name
        logo {
          url
        }
      }
      partnerOrganizations {
        id
        slug
        name
        logo {
          url
        }
      }
      useCases {
        id
        urlSlug
        title
        summary
        modified
        isIndividualUsecase
        user {
          fullName
          profilePicture {
            url
          }
        }
        organization {
          name
          logo {
            url
          }
        }
        logo {
          url
        }
        sectors {
          name
        }
        geographies {
          name
        }
        tags {
          value
        }
      }
      datasets {
        id
        urlSlug
        title
        description
        modified
        downloadCount
        isIndividualDataset
        user {
          fullName
          profilePicture {
            url
          }
        }
        organization {
          name
          logo {
            url
          }
        }
        sectors {
          name
        }
        geographies {
          name
        }
      }
      publications {
        id
        urlSlug
        title
        description
        publicationDate
        created
        isIndividualPublication
        resourceType {
          name
        }
        user {
          fullName
          profilePicture {
            url
          }
        }
        organization {
          name
          logo {
            url
          }
        }
        sectors {
          name
        }
        geographies {
          name
        }
      }
    }
  }
`);
