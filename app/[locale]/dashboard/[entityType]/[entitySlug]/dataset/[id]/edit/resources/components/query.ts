import { graphql } from '@/gql';

export const createResourceFilesDoc: any = graphql(`
  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {
    createFileResources(fileResourceInput: $fileResourceInput) {
      id
      created
      name
      type
    }
  }
`);

export const updateSchema: any = graphql(`
  mutation updateSchema($schemaUpdateInput: SchemaUpdateInput!) {
    updateFileResourceSchema(schemaUpdateInput: $schemaUpdateInput) {
      __typename
      ... on TypeResource {
        id
      }
    }
  }
`);

export const updateResourceDoc: any = graphql(`
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


export const fetchSchema: any = graphql(`
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

export const updateResourceList: any = graphql(`
  mutation deleteFileResource($resourceId: UUID!) {
    deleteFileResource(resourceId: $resourceId)
  }
`);
