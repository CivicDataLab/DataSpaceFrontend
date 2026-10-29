import { graphql } from '@/gql';

export const allOrganizationsListingDoc = graphql(`
  query allOrganizationsListingDoc {
    organizations {
      id
      name
      githubProfile
      linkedinProfile
      twitterProfile
      location
      logo {
        name
        url
      }
      slug
    }
  }
`);

export const allDataSpacesListingDoc = graphql(`
  query AllDataSpacesListDoc {
    dataspaces {
      id
      name
      logo {
        name
        url
      }
      slug
    }
  }
`);

export const organizationCreationMutation = graphql(`
  mutation createOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      __typename
      ... on TypeOrganization {
        id
        name
        logo {
          name
          url
        }
        homepage
        organizationTypes
        contactEmail
        description
        slug
        githubProfile
        linkedinProfile
        twitterProfile
        location
      }
    }
  }
`);
