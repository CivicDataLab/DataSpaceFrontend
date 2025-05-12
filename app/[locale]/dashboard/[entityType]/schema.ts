import { graphql } from '@/gql';

export const allOrganizationsListingDoc: any = graphql(`
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
        path
        size
        url
        width
        height
      }
      slug
    }
  }
`);

export const allDataSpacesListingDoc: any = graphql(`
  query AllDataSpacesListDoc {
    dataspaces {
      id
      name
      logo {
        name
        path
        size
        url
        width
        height
      }
      slug
    }
  }
`);

export const organizationCreationMutation: any = graphql(`
  mutation createOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      __typename
      ... on TypeOrganization {
        id
        name
        logo {
          name
          path
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
