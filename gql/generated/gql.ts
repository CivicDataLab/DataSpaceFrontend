/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query accessModelResource($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n        fields {\n          fieldName\n          format\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n": types.AccessModelResourceDocument,
    "\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n        modelResources {\n          fields {\n            format\n            fieldName\n            description\n          }\n        }\n      }\n      schema {\n        fieldName\n        id\n        format\n        description\n      }\n    }\n  }\n": types.DatasetResourcesDocument,
    "\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n": types.DatasetsDocument,
    "\n  query resources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      type\n      name\n      description\n      schema {\n        id\n        fieldName\n      }\n    }\n  }\n": types.ResourcesDocument,
    "\n  mutation createAccessModel($accessModelInput: AccessModelInput!) {\n    createAccessModel(accessModelInput: $accessModelInput) {\n      __typename\n      ... on TypeAccessModel {\n        id\n        description\n        name\n        type\n      }\n    }\n  }\n": types.CreateAccessModelDocument,
    "\n  query accessModelResources($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n": types.AccessModelResourcesDocument,
    "\n  query getResources($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      resources {\n        id\n        dataset {\n          pk\n        }\n        type\n        name\n        description\n        created\n        fileDetails {\n          id\n          resource {\n            pk\n          }\n          file {\n            name\n            path\n            url\n          }\n          size\n          created\n          modified\n        }\n      }\n    }\n  }\n": types.GetResourcesDocument,
    "\n  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n    createFileResources(fileResourceInput: $fileResourceInput) {\n      id\n      created\n      name\n    }\n  }\n": types.ReadFilesDocument,
    "\n  query datasetTitleQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      created\n    }\n  }\n": types.DatasetTitleQueryDocument,
    "\n  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {\n    updateDataset(updateDatasetInput: $updateDatasetInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        title\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n": types.SaveTitleDocument,
    "\n  query MetaDataQuery {\n    metadata {\n      id\n      label\n      dataStandard\n      urn\n      dataType\n      options\n      validator\n      type\n      model\n      enabled\n    }\n  }\n": types.MetaDataQueryDocument,
    "\n  mutation SaveMetadata($UpdateMetadataInput: UpdateMetadataInput!) {\n    addUpdateDatasetMetadata(updateMetadataInput: $UpdateMetadataInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n": types.SaveMetadataDocument,
    "\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  ": types.UpdateFileResourceDocument,
    "\n    mutation deleteFileResource($resourceId: UUID!) {\n      deleteFileResource(resourceId: $resourceId)\n    }\n  ": types.DeleteFileResourceDocument,
    "\n  query datasetQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n    }\n  }\n": types.DatasetQueryDocument,
    "\n  query datasetsSummary($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n      resources {\n        id\n        type\n        name\n        description\n        schema {\n          fieldName\n          id\n          format\n          description\n        }\n      }\n      accessModels {\n        id\n        name\n        description\n        type\n        created\n        modified\n        modelResources {\n          resource {\n            name\n            description\n            id\n            type\n          }\n        }\n      }\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n    }\n  }\n": types.DatasetsSummaryDocument,
    "\n  mutation publishDataset($datasetId: UUID!) {\n    publishDataset(datasetId: $datasetId) {\n      ... on TypeDataset {\n        id\n        status\n      }\n    }\n  }\n": types.PublishDatasetDocument,
    "\n  mutation GenerateDatasetName {\n    addDataset {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n": types.GenerateDatasetNameDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query accessModelResource($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n        fields {\n          fieldName\n          format\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n"): (typeof documents)["\n  query accessModelResource($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n        fields {\n          fieldName\n          format\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n        modelResources {\n          fields {\n            format\n            fieldName\n            description\n          }\n        }\n      }\n      schema {\n        fieldName\n        id\n        format\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n        modelResources {\n          fields {\n            format\n            fieldName\n            description\n          }\n        }\n      }\n      schema {\n        fieldName\n        id\n        format\n        description\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query resources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      type\n      name\n      description\n      schema {\n        id\n        fieldName\n      }\n    }\n  }\n"): (typeof documents)["\n  query resources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      type\n      name\n      description\n      schema {\n        id\n        fieldName\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createAccessModel($accessModelInput: AccessModelInput!) {\n    createAccessModel(accessModelInput: $accessModelInput) {\n      __typename\n      ... on TypeAccessModel {\n        id\n        description\n        name\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createAccessModel($accessModelInput: AccessModelInput!) {\n    createAccessModel(accessModelInput: $accessModelInput) {\n      __typename\n      ... on TypeAccessModel {\n        id\n        description\n        name\n        type\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getResource {\n    resource {\n      id\n      dataset {\n        pk\n      }\n      type\n      name\n      description\n      created\n      fileDetails {\n        id\n        resource {\n          pk\n        }\n        file {\n          name\n          path\n          url\n        }\n        size\n        created\n        modified\n      }\n    }\n  }\n"): (typeof documents)["\n  query getResource {\n    resource {\n      id\n      dataset {\n        pk\n      }\n      type\n      name\n      description\n      created\n      fileDetails {\n        id\n        resource {\n          pk\n        }\n        file {\n          name\n          path\n          url\n        }\n        size\n        created\n        modified\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n    createFileResources(fileResourceInput: $fileResourceInput) {\n      id\n      created\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n    createFileResources(fileResourceInput: $fileResourceInput) {\n      id\n      created\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasetTitleQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      created\n    }\n  }\n"): (typeof documents)["\n  query datasetTitleQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      created\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {\n    updateDataset(updateDatasetInput: $updateDatasetInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        title\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {\n    updateDataset(updateDatasetInput: $updateDatasetInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        title\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MetaDataQuery {\n    metadata {\n      id\n      label\n      dataStandard\n      urn\n      dataType\n      options\n      validator\n      type\n      model\n      enabled\n    }\n  }\n"): (typeof documents)["\n  query MetaDataQuery {\n    metadata {\n      id\n      label\n      dataStandard\n      urn\n      dataType\n      options\n      validator\n      type\n      model\n      enabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveMetadata($UpdateMetadataInput: UpdateMetadataInput!) {\n    addUpdateDatasetMetadata(updateMetadataInput: $UpdateMetadataInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SaveMetadata($UpdateMetadataInput: UpdateMetadataInput!) {\n    addUpdateDatasetMetadata(updateMetadataInput: $UpdateMetadataInput) {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation deleteFileResource($resourceId: UUID!) {\n      deleteFileResource(resourceId: $resourceId)\n    }\n  "): (typeof documents)["\n    mutation deleteFileResource($resourceId: UUID!) {\n      deleteFileResource(resourceId: $resourceId)\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasetQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query datasetQuery($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      id\n      title\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasetsSummary($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n      resources {\n        id\n        type\n        name\n        description\n        schema {\n          fieldName\n          id\n          format\n          description\n        }\n      }\n      accessModels {\n        id\n        name\n        description\n        type\n        created\n        modified\n        modelResources {\n          resource {\n            name\n            description\n            id\n            type\n          }\n        }\n      }\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n    }\n  }\n"): (typeof documents)["\n  query datasetsSummary($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        id\n        value\n      }\n      resources {\n        id\n        type\n        name\n        description\n        schema {\n          fieldName\n          id\n          format\n          description\n        }\n      }\n      accessModels {\n        id\n        name\n        description\n        type\n        created\n        modified\n        modelResources {\n          resource {\n            name\n            description\n            id\n            type\n          }\n        }\n      }\n      tags {\n        id\n        value\n      }\n      id\n      title\n      description\n      created\n      modified\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation publishDataset($datasetId: UUID!) {\n    publishDataset(datasetId: $datasetId) {\n      ... on TypeDataset {\n        id\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation publishDataset($datasetId: UUID!) {\n    publishDataset(datasetId: $datasetId) {\n      ... on TypeDataset {\n        id\n        status\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GenerateDatasetName {\n    addDataset {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation GenerateDatasetName {\n    addDataset {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;