import { graphql } from '@/gql';

export const getOrgDetailsQryDoc = graphql(`
  query getOrgDetailsQry($slug: String) {
    organizations(slug: $slug) {
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
`);

export const UserDetailsQryDoc = graphql(`
  query userDetails {
    me {
      bio
      email
      firstName
      lastName
      profilePicture {
        name
        url
      }
      username
      githubProfile
      linkedinProfile
      twitterProfile
      location
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
