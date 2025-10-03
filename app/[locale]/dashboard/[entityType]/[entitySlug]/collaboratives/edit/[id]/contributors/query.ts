import { graphql } from '@/gql';


export const FetchUsers: any = graphql(`
    query searchUsers($limit: Int!, $searchTerm: String!) {
      searchUsers(limit: $limit, searchTerm: $searchTerm) {
        id
        fullName
        username
      }
    }
  `);

export const FetchCollaborativeInfo: any = graphql(`
    query collaborativeinfo($filters: CollaborativeFilter) {
      collaboratives(filters: $filters) {
        id
        title
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
        partnerOrganizations{
          id
          name
          logo{
            url
            name
          }
        }  
      }
    }
  `);

export const AddContributors: any = graphql(`
    mutation addContributorToCollaborative($collaborativeId: String!, $userId: ID!) {
      addContributorToCollaborative(collaborativeId: $collaborativeId, userId: $userId) {
        __typename
        ... on TypeCollaborative {
          id
          title
          contributors {
            id
            fullName
            username
          }
        }
      }
    }
  `);

export const RemoveContributor: any = graphql(`
    mutation removeContributorFromCollaborative($collaborativeId: String!, $userId: ID!) {
      removeContributorFromCollaborative(collaborativeId: $collaborativeId, userId: $userId) {
        __typename
        ... on TypeCollaborative {
          id
          title
          contributors {
            id
            fullName
            username
          }
        }
      }
    }
  `);

export const AddSupporters: any = graphql(`
    mutation addSupportingOrganizationToCollaborative(
      $collaborativeId: String!
      $organizationId: ID!
    ) {
      addSupportingOrganizationToCollaborative(
        collaborativeId: $collaborativeId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeCollaborativeOrganizationRelationship {
          organization {
            id
            name
            logo {
              url
              name
            }
          }
        }
      }
    }
  `);

export const RemoveSupporters: any = graphql(`
    mutation removeSupportingOrganizationFromCollaborative(
      $collaborativeId: String!
      $organizationId: ID!
    ) {
      removeSupportingOrganizationFromCollaborative(
        collaborativeId: $collaborativeId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeCollaborativeOrganizationRelationship {
          organization {
            id
            name
            logo {
              url
              name
            }
          }
        }
      }
    }
  `);

export const AddPartners: any = graphql(`
    mutation addPartnerOrganizationToCollaborative(
      $collaborativeId: String!
      $organizationId: ID!
    ) {
      addPartnerOrganizationToCollaborative(
        collaborativeId: $collaborativeId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeCollaborativeOrganizationRelationship {
          organization {
            id
            name
            logo {
              url
              name
            }
          }
        }
      }
    }
  `);

export const RemovePartners: any = graphql(`
    mutation removePartnerOrganizationFromCollaborative(
      $collaborativeId: String!
      $organizationId: ID!
    ) {
      removePartnerOrganizationFromCollaborative(
        collaborativeId: $collaborativeId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeCollaborativeOrganizationRelationship {
          organization {
            id
            name
            logo {
              url
              name
            }
          }
        }
      }
    }
  `);


export const OrgList: any = graphql(`
  query allOrgs {
    allOrganizations {
      id
      name
      logo {
        path
        url
      }
    }
  }
`);