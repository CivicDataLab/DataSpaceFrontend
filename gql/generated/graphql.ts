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

export type AccessModelInput = {
  dataset: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  resources: Array<AccessModelResourceInput>;
  type: AccessTypes;
};

export type AccessModelResourceInput = {
  fields: Array<Scalars['Int']>;
  resource: Scalars['UUID'];
};

export enum AccessTypes {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export type AddDatasetPayload = OperationInfo | TypeDataset;

export type AddUpdateDatasetMetadataPayload = OperationInfo | TypeDataset;

export type CreateAccessModelPayload = OperationInfo | TypeAccessModel;

export type CreateFileResourceInput = {
  dataset: Scalars['UUID'];
  files: Array<Scalars['Upload']>;
};

export type DsMetadataItemType = {
  id: Scalars['String'];
  value: Scalars['String'];
};

/** Dataset(id, title, description, organization, created, modified, status) */
export type DatasetFilter = {
  AND?: InputMaybe<DatasetFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<DatasetFilter>;
  OR?: InputMaybe<DatasetFilter>;
  id: Scalars['UUID'];
};

export type DjangoFileType = {
  __typename?: 'DjangoFileType';
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['Int'];
  url: Scalars['String'];
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
  createAccessModel: CreateAccessModelPayload;
  createFileResources: Array<TypeResource>;
  createMetadata: TypeMetadata;
  deleteFileResource: Scalars['Boolean'];
  deleteMetadata: TypeMetadata;
  publishDataset: PublishDatasetPayload;
  resetFileResourceSchema: ResetFileResourceSchemaPayload;
  updateDataset: UpdateDatasetPayload;
  updateFileResource: UpdateFileResourcePayload;
  updateMetadata: TypeMetadata;
};


export type MutationAddUpdateDatasetMetadataArgs = {
  updateMetadataInput: UpdateMetadataInput;
};


export type MutationCreateAccessModelArgs = {
  accessModelInput: AccessModelInput;
};


export type MutationCreateFileResourcesArgs = {
  fileResourceInput: CreateFileResourceInput;
};


export type MutationCreateMetadataArgs = {
  data: MetadataInput;
};


export type MutationDeleteFileResourceArgs = {
  resourceId: Scalars['UUID'];
};


export type MutationDeleteMetadataArgs = {
  data: NodeInput;
};


export type MutationPublishDatasetArgs = {
  datasetId: Scalars['UUID'];
};


export type MutationResetFileResourceSchemaArgs = {
  resourceId: Scalars['UUID'];
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

export type PublishDatasetPayload = OperationInfo | TypeDataset;

export type Query = {
  __typename?: 'Query';
  accessModelResources: Array<TypeAccessModel>;
  datasetResources: Array<TypeResource>;
  datasets: Array<TypeDataset>;
  metadata: Array<TypeMetadata>;
  resource: Array<TypeResource>;
};


export type QueryAccessModelResourcesArgs = {
  datasetId: Scalars['UUID'];
};


export type QueryDatasetResourcesArgs = {
  datasetId: Scalars['UUID'];
};


export type QueryDatasetsArgs = {
  filters?: InputMaybe<DatasetFilter>;
};

export type ResetFileResourceSchemaPayload = OperationInfo | TypeResource;

/** AccessModel(id, name, description, dataset, type, organization, created, modified) */
export type TypeAccessModel = {
  __typename?: 'TypeAccessModel';
  created: Scalars['DateTime'];
  dataset: DjangoModelType;
  description: Scalars['String'];
  id: Scalars['UUID'];
  modelResources: Array<TypeAccessModelResource>;
  modified: Scalars['DateTime'];
  name: Scalars['String'];
  organization?: Maybe<DjangoModelType>;
  type: Scalars['String'];
};

/** AccessModelResource(id, access_model, resource) */
export type TypeAccessModelResource = {
  __typename?: 'TypeAccessModelResource';
  accessModel: DjangoModelType;
  id: Scalars['ID'];
  resource: TypeResource;
};

/** AccessModelResource(id, access_model, resource) */
export type TypeAccessModelResourceFields = {
  __typename?: 'TypeAccessModelResourceFields';
  fields: Array<Scalars['UUID']>;
};

/** Dataset(id, title, description, organization, created, modified, status) */
export type TypeDataset = {
  __typename?: 'TypeDataset';
  accessModels: Array<TypeAccessModel>;
  created: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['UUID'];
  metadata: Array<TypeDatasetMetadata>;
  modified: Scalars['DateTime'];
  organization?: Maybe<DjangoModelType>;
  resources: Array<TypeResource>;
  status: Scalars['String'];
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

/** ResourceFileDetails(id, resource, file, size, created, modified, format) */
export type TypeFileDetails = {
  __typename?: 'TypeFileDetails';
  created: Scalars['DateTime'];
  file: DjangoFileType;
  format: Scalars['String'];
  id: Scalars['ID'];
  modified: Scalars['DateTime'];
  resource: DjangoModelType;
  size?: Maybe<Scalars['Float']>;
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
  accessModels: Array<TypeResourceAccessModel>;
  created: Scalars['DateTime'];
  dataset?: Maybe<DjangoModelType>;
  description: Scalars['String'];
  fileDetails?: Maybe<TypeFileDetails>;
  id: Scalars['UUID'];
  metadata: Array<TypeResourceMetadata>;
  modified: Scalars['DateTime'];
  name: Scalars['String'];
  schema?: Maybe<Array<TypeResourceSchema>>;
  type: Scalars['String'];
};

/** AccessModel(id, name, description, dataset, type, organization, created, modified) */
export type TypeResourceAccessModel = {
  __typename?: 'TypeResourceAccessModel';
  created: Scalars['DateTime'];
  dataset: DjangoModelType;
  description: Scalars['String'];
  id: Scalars['UUID'];
  modelResources: Array<TypeAccessModelResourceFields>;
  modified: Scalars['DateTime'];
  name: Scalars['String'];
  organization?: Maybe<DjangoModelType>;
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

/** ResourceSchema(id, resource, field_name, format, description) */
export type TypeResourceSchema = {
  __typename?: 'TypeResourceSchema';
  description?: Maybe<Scalars['String']>;
  fieldName: Scalars['String'];
  format: Scalars['String'];
  id: Scalars['ID'];
  resource: DjangoModelType;
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

export type AccessModelResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type AccessModelResourcesQuery = { __typename?: 'Query', accessModelResources: Array<{ __typename?: 'TypeAccessModel', id: any, name: string, description: string, type: string, created: any, modified: any, modelResources: Array<{ __typename?: 'TypeAccessModelResource', resource: { __typename?: 'TypeResource', name: string, description: string, id: any } }> }> };

export type DatasetResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type DatasetResourcesQuery = { __typename?: 'Query', datasetResources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: string, name: string, description: string, accessModels: Array<{ __typename?: 'TypeResourceAccessModel', name: string, description: string, type: string }> }> };

export type DatasetsQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetsQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', tags: Array<string>, id: any, title: string, description: string, created: any, modified: any, metadata: Array<{ __typename?: 'TypeDatasetMetadata', value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }>, resources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: string, name: string, description: string }> }> };

export type GetResourceQueryVariables = Exact<{ [key: string]: never; }>;


export type GetResourceQuery = { __typename?: 'Query', resource: Array<{ __typename?: 'TypeResource', id: any, type: string, name: string, description: string, created: any, dataset?: { __typename?: 'DjangoModelType', pk: string } | null }> };

export type ReadFilesMutationVariables = Exact<{
  fileResourceInput: CreateFileResourceInput;
}>;


export type ReadFilesMutation = { __typename?: 'Mutation', createFileResources: Array<{ __typename?: 'TypeResource', id: any, created: any, name: string }> };

export type MetaDataQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MetaDataQueryQuery = { __typename?: 'Query', metadata: Array<{ __typename?: 'TypeMetadata', id: string, label: string, dataStandard: string, urn: string, dataType: string, options: string, validator: string, type: string, model: string, enabled: boolean }> };

export type SaveMetadataMutationVariables = Exact<{
  UpdateMetadataInput: UpdateMetadataInput;
}>;


export type SaveMetadataMutation = { __typename?: 'Mutation', addUpdateDatasetMetadata: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, created: any } };

export type UpdateFileResourceMutationVariables = Exact<{
  fileResourceInput: UpdateFileResourceInput;
}>;


export type UpdateFileResourceMutation = { __typename?: 'Mutation', updateFileResource: { __typename: 'OperationInfo' } | { __typename: 'TypeResource', id: any, description: string, name: string } };

export type DeleteFileResourceMutationVariables = Exact<{
  resourceId: Scalars['UUID'];
}>;


export type DeleteFileResourceMutation = { __typename?: 'Mutation', deleteFileResource: boolean };

export type DatasetQueryQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetQueryQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', id: any, title: string, metadata: Array<{ __typename?: 'TypeDatasetMetadata', id: string, value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }> }> };

export type DatasetsSummaryQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetsSummaryQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', tags: Array<string>, id: any, title: string, description: string, created: any, modified: any, metadata: Array<{ __typename?: 'TypeDatasetMetadata', id: string, value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }>, resources: Array<{ __typename?: 'TypeResource', id: any, type: string, name: string, description: string }>, accessModels: Array<{ __typename?: 'TypeAccessModel', id: any, name: string, description: string, type: string, created: any, modified: any }> }> };

export type PublishDatasetMutationVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type PublishDatasetMutation = { __typename?: 'Mutation', publishDataset: { __typename?: 'OperationInfo' } | { __typename?: 'TypeDataset', id: any, status: string } };

export type GenerateDatasetNameMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateDatasetNameMutation = { __typename?: 'Mutation', addDataset: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, created: any } };


export const AccessModelResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"accessModelResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessModelResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<AccessModelResourcesQuery, AccessModelResourcesQueryVariables>;
export const DatasetResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasetResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"accessModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetResourcesQuery, DatasetResourcesQueryVariables>;
export const DatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetsQuery, DatasetsQueryVariables>;
export const GetResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getResource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}}]}}]} as unknown as DocumentNode<GetResourceQuery, GetResourceQueryVariables>;
export const ReadFilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"readFiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFileResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFileResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileResourceInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ReadFilesMutation, ReadFilesMutationVariables>;
export const MetaDataQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetaDataQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"dataStandard"}},{"kind":"Field","name":{"kind":"Name","value":"urn"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"validator"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<MetaDataQueryQuery, MetaDataQueryQueryVariables>;
export const SaveMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"UpdateMetadataInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addUpdateDatasetMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"updateMetadataInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"UpdateMetadataInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SaveMetadataMutation, SaveMetadataMutationVariables>;
export const UpdateFileResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateFileResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFileResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFileResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileResourceInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeResource"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateFileResourceMutation, UpdateFileResourceMutationVariables>;
export const DeleteFileResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteFileResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFileResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}}]}]}}]} as unknown as DocumentNode<DeleteFileResourceMutation, DeleteFileResourceMutationVariables>;
export const DatasetQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetQueryQuery, DatasetQueryQueryVariables>;
export const DatasetsSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetsSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<DatasetsSummaryQuery, DatasetsSummaryQueryVariables>;
export const PublishDatasetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"publishDataset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PublishDatasetMutation, PublishDatasetMutationVariables>;
export const GenerateDatasetNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateDatasetName"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addDataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GenerateDatasetNameMutation, GenerateDatasetNameMutationVariables>;