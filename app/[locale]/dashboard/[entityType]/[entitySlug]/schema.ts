import gql from 'graphql-tag';

export const getOrgDetailsQryDoc: any = gql`
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
      githubProfile
      linkedinProfile
      twitterProfile
      location
    }
  }
`;

export const UserDetailsQryDoc: any = gql`
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
`;