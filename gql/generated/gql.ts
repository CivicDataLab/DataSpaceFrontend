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
    "\n  query accessModelResources($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n": types.AccessModelResourcesDocument,
    "\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n      }\n    }\n  }\n": types.DatasetResourcesDocument,
    "\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n": types.DatasetsDocument,
    "\n    mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n      createFileResources(fileResourceInput: $fileResourceInput) {\n        id\n        created\n        name\n      }\n    }\n  ": types.ReadFilesDocument,
    "\n  query getResource {\n    resource {\n      id\n      dataset {\n        pk\n      }\n      type\n      name\n      description\n    }\n  }\n": types.GetResourceDocument,
    "\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  ": types.UpdateFileResourceDocument,
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
export function graphql(source: "\n  query accessModelResources($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n"): (typeof documents)["\n  query accessModelResources($datasetId: UUID!) {\n    accessModelResources(datasetId: $datasetId) {\n      modelResources {\n        resource {\n          name\n          description\n          id\n        }\n      }\n      id\n      name\n      description\n      type\n      created\n      modified\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  query datasetResources($datasetId: UUID!) {\n    datasetResources(datasetId: $datasetId) {\n      id\n      created\n      modified\n      type\n      name\n      description\n      accessModels {\n        name\n        description\n        type\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  query datasets($filters: DatasetFilter) {\n    datasets(filters: $filters) {\n      tags\n      id\n      title\n      description\n      created\n      modified\n      metadata {\n        metadataItem {\n          id\n          label\n        }\n        value\n      }\n      resources {\n        id\n        created\n        modified\n        type\n        name\n        description\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n      createFileResources(fileResourceInput: $fileResourceInput) {\n        id\n        created\n        name\n      }\n    }\n  "): (typeof documents)["\n    mutation readFiles($fileResourceInput: CreateFileResourceInput!) {\n      createFileResources(fileResourceInput: $fileResourceInput) {\n        id\n        created\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getResource {\n    resource {\n      id\n      dataset {\n        pk\n      }\n      type\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query getResource {\n    resource {\n      id\n      dataset {\n        pk\n      }\n      type\n      name\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {\n      updateFileResource(fileResourceInput: $fileResourceInput) {\n        __typename\n        ... on TypeResource {\n          id\n          description\n          name\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GenerateDatasetName {\n    addDataset {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation GenerateDatasetName {\n    addDataset {\n      __typename\n      ... on TypeDataset {\n        id\n        created\n      }\n      ... on OperationInfo {\n        messages {\n          kind\n          message\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;