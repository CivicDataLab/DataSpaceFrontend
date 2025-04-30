import { graphql } from '@/gql';

export const getOrgDetailsQryDoc: any = graphql(`
  query getOrgDetailsQry($slug: String) {
    organizations(slug: $slug) {
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
      homepage
      organizationTypes
      contactEmail
      description
      slug
    }
  }
`);

export const UserDetailsQryDoc: any = graphql(`
  query userDetails {
    me {
      bio
      email
      firstName
      lastName
      profilePicture {
        name
        path
        url
      }
      username
      id
      organizationMemberships {
        organization {
          name
          id
        }
        role {
          name
        }
      }
    }
  }
`);