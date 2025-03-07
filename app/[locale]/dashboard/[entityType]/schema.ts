import { graphql } from '@/gql';

export const allOrganizationsListingDoc: any = graphql(`
  query allOrganizationsListingDoc {
    organizations {
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
