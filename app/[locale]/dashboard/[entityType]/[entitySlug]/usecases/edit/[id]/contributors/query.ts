import { graphql } from '@/gql';


export const FetchUsers = graphql(`
    query searchUsers($limit: Int!, $searchTerm: String!) {
      searchUsers(limit: $limit, searchTerm: $searchTerm) {
        id
        fullName
        username
      }
    }
  `);

export const FetchUsecaseInfo = graphql(`
    query useCaseinfo($filters: UseCaseFilter) {
      useCases(filters: $filters) {
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

export const AddContributors = graphql(`
    mutation addContributorToUseCase($useCaseId: String!, $userId: ID!) {
      addContributorToUseCase(useCaseId: $useCaseId, userId: $userId) {
        __typename
        ... on TypeUseCase {
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

export const RemoveContributor = graphql(`
    mutation removeContributorFromUseCase($useCaseId: String!, $userId: ID!) {
      removeContributorFromUseCase(useCaseId: $useCaseId, userId: $userId) {
        __typename
        ... on TypeUseCase {
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

export const AddSupporters = graphql(`
    mutation addSupportingOrganizationToUseCase(
      $useCaseId: String!
      $organizationId: ID!
    ) {
      addSupportingOrganizationToUseCase(
        useCaseId: $useCaseId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeUseCaseOrganizationRelationship {
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

export const RemoveSupporters = graphql(`
    mutation removeSupportingOrganizationFromUseCase(
      $useCaseId: String!
      $organizationId: ID!
    ) {
      removeSupportingOrganizationFromUseCase(
        useCaseId: $useCaseId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeUseCaseOrganizationRelationship {
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

export const AddPartners = graphql(`
    mutation addPartnerOrganizationToUseCase(
      $useCaseId: String!
      $organizationId: ID!
    ) {
      addPartnerOrganizationToUseCase(
        useCaseId: $useCaseId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeUseCaseOrganizationRelationship {
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

export const RemovePartners = graphql(`
    mutation removePartnerOrganizationFromUseCase(
      $useCaseId: String!
      $organizationId: ID!
    ) {
      removePartnerOrganizationFromUseCase(
        useCaseId: $useCaseId
        organizationId: $organizationId
      ) {
        __typename
        ... on TypeUseCaseOrganizationRelationship {
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


export const OrgList = graphql(`
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