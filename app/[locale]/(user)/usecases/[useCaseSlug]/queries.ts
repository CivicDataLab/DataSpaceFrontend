import { graphql } from '@/gql';

export const useCaseDetailsQuery = graphql(`
  query UseCasedetails($publicId: String!) {
    useCaseBySlug(publicId: $publicId) {
    id
    urlSlug
    title
    summary
    created
    isIndividualUsecase
    user {
      fullName
      id
      profilePicture {
        url
      }
    }
    organization {
      name
      slug
      id
      logo {
        url
      }
    }
    sectors {
      id
      name
    }
    geographies {
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
    logo {
      url
    }
    datasets {
      title
      id
      urlSlug
      isIndividualDataset
      user {
        fullName
        profilePicture {
          url
        }
      }
      downloadCount
      description
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
      modified
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
    }
  }
`);
