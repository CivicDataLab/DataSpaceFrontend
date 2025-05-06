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
  
  export const FetchUsecaseInfo: any = graphql(`
    query useCaseinfo($filters: UseCaseFilter) {
      useCases(filters: $filters) {
        id
        title
        contributors {
          id
          fullName
          username
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
  
  export const RemoveContributor: any = graphql(`
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
  
  export const AddSupporters: any = graphql(`
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
  
  export const RemoveSupporters: any = graphql(`
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
  
  export const AddPartners: any = graphql(`
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
  
  export const RemovePartners: any = graphql(`
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