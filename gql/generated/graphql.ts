/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date with time (isoformat) */
  DateTime: any;
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  GlobalID: any;
  UUID: any;
  Upload: any;
};

export type AddDatasetPayload = OperationInfo | TypeDataset;

export type AddUpdateDatasetMetadataPayload = OperationInfo | TypeDataset;

export type CreateFileResourceInput = {
  dataset: Scalars['UUID'];
  files: Array<Scalars['Upload']>;
};

export type DsMetadataItemType = {
  id: Scalars['String'];
  value: Scalars['String'];
};

/** Dataset(id, title, description, organization, created, modified) */
export type DatasetFilter = {
  AND?: InputMaybe<DatasetFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<DatasetFilter>;
  OR?: InputMaybe<DatasetFilter>;
  id: Scalars['UUID'];
};

export type DjangoModelType = {
  __typename?: 'DjangoModelType';
  pk: Scalars['ID'];
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type MetadataInput = {
  dataStandard?: InputMaybe<Scalars['String']>;
  dataType: Scalars['String'];
  enabled?: InputMaybe<Scalars['Boolean']>;
  filterable?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
  label: Scalars['String'];
  model: Scalars['String'];
  options?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
  urn?: InputMaybe<Scalars['String']>;
  validator?: InputMaybe<Scalars['String']>;
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type MetadataInputPartial = {
  dataStandard?: InputMaybe<Scalars['String']>;
  dataType?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  filterable?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['GlobalID'];
  label?: InputMaybe<Scalars['String']>;
  model?: InputMaybe<Scalars['String']>;
  options?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
  urn?: InputMaybe<Scalars['String']>;
  validator?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addDataset: AddDatasetPayload;
  addUpdateDatasetMetadata: AddUpdateDatasetMetadataPayload;
  createFileResources: Array<TypeResource>;
  createMetadata: TypeMetadata;
  deleteMetadata: TypeMetadata;
  updateDataset: UpdateDatasetPayload;
  updateFileResource: UpdateFileResourcePayload;
  updateMetadata: TypeMetadata;
};


export type MutationAddUpdateDatasetMetadataArgs = {
  updateMetadataInput: UpdateMetadataInput;
};


export type MutationCreateFileResourcesArgs = {
  fileResourceInput: CreateFileResourceInput;
};


export type MutationCreateMetadataArgs = {
  data: MetadataInput;
};


export type MutationDeleteMetadataArgs = {
  data: NodeInput;
};


export type MutationUpdateDatasetArgs = {
  updateDatasetInput: UpdateDatasetInput;
};


export type MutationUpdateFileResourceArgs = {
  fileResourceInput: UpdateFileResourceInput;
};


export type MutationUpdateMetadataArgs = {
  data: MetadataInputPartial;
};

/** Input of an object that implements the `Node` interface. */
export type NodeInput = {
  id: Scalars['GlobalID'];
};

export type OperationInfo = {
  __typename?: 'OperationInfo';
  /** List of messages returned by the operation. */
  messages: Array<OperationMessage>;
};

export type OperationMessage = {
  __typename?: 'OperationMessage';
  /** The error code, or `null` if no error code was set. */
  code?: Maybe<Scalars['String']>;
  /** The field that caused the error, or `null` if it isn't associated with any particular field. */
  field?: Maybe<Scalars['String']>;
  /** The kind of this message. */
  kind: OperationMessageKind;
  /** The error message. */
  message: Scalars['String'];
};

export enum OperationMessageKind {
  Error = 'ERROR',
  Info = 'INFO',
  Permission = 'PERMISSION',
  Validation = 'VALIDATION',
  Warning = 'WARNING'
}

export type Query = {
  __typename?: 'Query';
  dataset: TypeDataset;
  datasetResources: Array<TypeResource>;
  datasets: Array<TypeDataset>;
  metadata: Array<TypeMetadata>;
  resource: Array<TypeResource>;
};


export type QueryDatasetResourcesArgs = {
  datasetId: Scalars['UUID'];
};


export type QueryDatasetsArgs = {
  filters?: InputMaybe<DatasetFilter>;
};

/** Dataset(id, title, description, organization, created, modified) */
export type TypeDataset = {
  __typename?: 'TypeDataset';
  created: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['UUID'];
  metadata: Array<TypeDatasetMetadata>;
  modified: Scalars['DateTime'];
  organization?: Maybe<DjangoModelType>;
  resources: Array<TypeResource>;
  tags: Array<Scalars['String']>;
  title: Scalars['String'];
};

/** DatasetMetadata(id, dataset, metadata_item, value) */
export type TypeDatasetMetadata = {
  __typename?: 'TypeDatasetMetadata';
  dataset: DjangoModelType;
  id: Scalars['ID'];
  metadataItem: TypeMetadata;
  value: Scalars['String'];
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type TypeMetadata = {
  __typename?: 'TypeMetadata';
  dataStandard: Scalars['String'];
  dataType: Scalars['String'];
  enabled: Scalars['Boolean'];
  filterable: Scalars['Boolean'];
  id: Scalars['ID'];
  label: Scalars['String'];
  model: Scalars['String'];
  options: Scalars['String'];
  type: Scalars['String'];
  urn: Scalars['String'];
  validator: Scalars['String'];
};

/** Resource(id, dataset, created, modified, type, name, description) */
export type TypeResource = {
  __typename?: 'TypeResource';
  created: Scalars['DateTime'];
  dataset?: Maybe<DjangoModelType>;
  description: Scalars['String'];
  id: Scalars['UUID'];
  metadata: Array<TypeResourceMetadata>;
  modified: Scalars['DateTime'];
  name: Scalars['String'];
  type: Scalars['String'];
};

/** ResourceMetadata(id, resource, metadata_item, value) */
export type TypeResourceMetadata = {
  __typename?: 'TypeResourceMetadata';
  id: Scalars['ID'];
  metadataItem: TypeMetadata;
  resource: DjangoModelType;
  value: Scalars['String'];
};

export type UpdateDatasetInput = {
  dataset: Scalars['UUID'];
  description: Scalars['String'];
  tags: Array<Scalars['String']>;
  title: Scalars['String'];
};

export type UpdateDatasetPayload = OperationInfo | TypeDataset;

export type UpdateFileResourceInput = {
  description?: InputMaybe<Scalars['String']>;
  file?: InputMaybe<Scalars['Upload']>;
  id: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateFileResourcePayload = OperationInfo | TypeResource;

export type UpdateMetadataInput = {
  dataset: Scalars['UUID'];
  metadata: Array<DsMetadataItemType>;
};

export type GetMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMetadataQuery = { __typename?: 'Query', metadata: Array<{ __typename?: 'TypeMetadata', id: string, label: string, dataStandard: string, urn: string, dataType: string, options: string, validator: string, type: string, model: string, enabled: boolean, filterable: boolean }> };

export type DatasetResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type DatasetResourcesQuery = { __typename?: 'Query', datasetResources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: string, name: string, description: string }> };

export type DatasetsQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetsQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', tags: Array<string>, id: any, title: string, description: string, created: any, modified: any, metadata: Array<{ __typename?: 'TypeDatasetMetadata', value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }>, resources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: string, name: string, description: string }> }> };

export type GenerateDatasetNameMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateDatasetNameMutation = { __typename?: 'Mutation', addDataset: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, created: any } };


export const GetMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"dataStandard"}},{"kind":"Field","name":{"kind":"Name","value":"urn"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"validator"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"filterable"}}]}}]}}]} as unknown as DocumentNode<GetMetadataQuery, GetMetadataQueryVariables>;
export const DatasetResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasetResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<DatasetResourcesQuery, DatasetResourcesQueryVariables>;
export const DatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetsQuery, DatasetsQueryVariables>;
export const GenerateDatasetNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateDatasetName"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addDataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GenerateDatasetNameMutation, GenerateDatasetNameMutationVariables>;