import { graphql } from '@/gql';

export const aiModelQuery = graphql(`
  query getAIModel($modelId: Int, $publicId: String) {
    getAiModel(modelId: $modelId, publicId: $publicId) {
      id
      urlSlug
      name
      displayName
      description
      modelType
      domain
      metadata
      status
      isPublic
      isActive
      createdAt
      updatedAt
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      organization {
        id
        name
        logo {
          url
        }
      }
      user {
        id
        fullName
        profilePicture {
          url
        }
      }
      versions {
        id
        version
        versionNotes
        lifecycleStage
        isLatest
        supportsStreaming
        maxTokens
        supportedLanguages
        status
        createdAt
        updatedAt
        providers {
          id
          provider
          providerModelId
          isPrimary
          isActive
          apiEndpointUrl
          apiHttpMethod
          apiTimeoutSeconds
          apiAuthType
          hfUsePipeline
          hfModelClass
          framework
        }
      }
    }
  }
`);
