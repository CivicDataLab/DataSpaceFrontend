import { graphql } from '@/gql';

export const createResourceFilesDoc = graphql(`
  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {
    createFileResources(fileResourceInput: $fileResourceInput) {
      id
      created
      name
      type
    }
  }
`);

export const updateSchema = graphql(`
  mutation updateSchema($schemaUpdateInput: SchemaUpdateInput!) {
    updateFileResourceSchema(schemaUpdateInput: $schemaUpdateInput) {
      __typename
      ... on TypeResource {
        id
      }
    }
  }
`);

export const updateResourceDoc = graphql(`
  mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {
    updateFileResource(fileResourceInput: $fileResourceInput) {
      __typename
      ... on TypeResource {
        id
        description
        name
      }
    }
  }
`);

export const fetchSchema = graphql(`
  query datasetSchema($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      schema {
        id
        fieldName
        format
        description
      }
      id
    }
  }
`);

export const updateResourceList = graphql(`
  mutation deleteFileResource($resourceId: UUID!) {
    deleteFileResource(resourceId: $resourceId)
  }
`);

export const resourceByIdDoc = graphql(`
  query resourceById($resourceId: UUID!) {
    resourceById(resourceId: $resourceId) {
      id
      dataset {
        pk
      }
      previewData {
        columns
        rows
      }
      previewDetails {
        endEntry
        isAllEntries
        startEntry
      }
      previewEnabled
      schema {
        id
        fieldName
        format
        description
      }
      type
      name
      description
      created
      fileDetails {
        id
        resource {
          pk
        }
        format
        file {
          name
          path
          url
        }
        size
        created
        modified
      }
      promptDetails {
        promptFormat
        hasSystemPrompt
        hasExampleResponses
        avgPromptLength
        promptCount
      }
    }
  }
`);
