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

/** access model | type */
export enum ApiAccessModelTypeEnum {
  /** Private */
  Private = 'PRIVATE',
  /** Protected */
  Protected = 'PROTECTED',
  /** Public */
  Public = 'PUBLIC'
}

/** dataset | status */
export enum ApiDatasetStatusEnum {
  /** Archived */
  Archived = 'ARCHIVED',
  /** Draft */
  Draft = 'DRAFT',
  /** Published */
  Published = 'PUBLISHED'
}

/** metadata | data standard */
export enum ApiMetadataDataStandardEnum {
  /** Dcatv3 */
  Dcatv3 = 'DCATV3',
  /** Na */
  Na = 'NA',
  /** Obds */
  Obds = 'OBDS',
  /** Ocds */
  Ocds = 'OCDS'
}

/** metadata | data type */
export enum ApiMetadataDataTypeEnum {
  /** Date */
  Date = 'DATE',
  /** Multiselect */
  Multiselect = 'MULTISELECT',
  /** Number */
  Number = 'NUMBER',
  /** Select */
  Select = 'SELECT',
  /** String */
  String = 'STRING'
}

/** metadata | model */
export enum ApiMetadataModelEnum {
  /** Dataset */
  Dataset = 'DATASET',
  /** Reseource */
  Resource = 'RESOURCE'
}

/** metadata | type */
export enum ApiMetadataTypeEnum {
  /** Advanced */
  Advanced = 'ADVANCED',
  /** Optional */
  Optional = 'OPTIONAL',
  /** Required */
  Required = 'REQUIRED'
}

/** resource schema | format */
export enum ApiResourceSchemaFormatEnum {
  /** Date */
  Date = 'DATE',
  /** Integer */
  Integer = 'INTEGER',
  /** Number */
  Number = 'NUMBER',
  /** String */
  String = 'STRING'
}

/** resource | type */
export enum ApiResourceTypeEnum {
  /** Api */
  Api = 'API',
  /** External */
  External = 'EXTERNAL',
  /** File */
  File = 'FILE'
}

/** Category(id, name, description, parent_id) */
export type CategoryInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  parentId?: InputMaybe<Scalars['ID']>;
};

/** Category(id, name, description, parent_id) */
export type CategoryInputPartial = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['ID']>;
};

/** access model | type */
export enum ApiAccessModelTypeEnum {
  /** Private */
  Private = 'PRIVATE',
  /** Protected */
  Protected = 'PROTECTED',
  /** Public */
  Public = 'PUBLIC'
}

/** dataset | status */
export enum ApiDatasetStatusEnum {
  /** Archived */
  Archived = 'ARCHIVED',
  /** Draft */
  Draft = 'DRAFT',
  /** Published */
  Published = 'PUBLISHED'
}

/** metadata | data standard */
export enum ApiMetadataDataStandardEnum {
  /** Dcatv3 */
  Dcatv3 = 'DCATV3',
  /** Na */
  Na = 'NA',
  /** Obds */
  Obds = 'OBDS',
  /** Ocds */
  Ocds = 'OCDS'
}

/** metadata | data type */
export enum ApiMetadataDataTypeEnum {
  /** Date */
  Date = 'DATE',
  /** Multiselect */
  Multiselect = 'MULTISELECT',
  /** Number */
  Number = 'NUMBER',
  /** Select */
  Select = 'SELECT',
  /** String */
  String = 'STRING'
}

/** metadata | model */
export enum ApiMetadataModelEnum {
  /** Dataset */
  Dataset = 'DATASET',
  /** Reseource */
  Resource = 'RESOURCE'
}

/** metadata | type */
export enum ApiMetadataTypeEnum {
  /** Advanced */
  Advanced = 'ADVANCED',
  /** Optional */
  Optional = 'OPTIONAL',
  /** Required */
  Required = 'REQUIRED'
}

/** resource schema | format */
export enum ApiResourceSchemaFormatEnum {
  /** Date */
  Date = 'DATE',
  /** Integer */
  Integer = 'INTEGER',
  /** Number */
  Number = 'NUMBER',
  /** String */
  String = 'STRING'
}

/** resource | type */
export enum ApiResourceTypeEnum {
  /** Api */
  Api = 'API',
  /** External */
  External = 'EXTERNAL',
  /** File */
  File = 'FILE'
}

/** Category(id, name, description, parent_id) */
export type CategoryInput = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  parentId?: InputMaybe<Scalars['ID']>;
};

/** Category(id, name, description, parent_id) */
export type CategoryInputPartial = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['ID']>;
};

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

export type EditAccessModelInput = {
  accessModelId: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  resources: Array<AccessModelResourceInput>;
  type: AccessTypes;
};

export type EditAccessModelPayload = OperationInfo | TypeAccessModel;

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type MetadataFilter = {
  AND?: InputMaybe<MetadataFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<MetadataFilter>;
  OR?: InputMaybe<MetadataFilter>;
  enabled: Scalars['Boolean'];
  model: Scalars['String'];
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type MetadataInput = {
  dataStandard?: InputMaybe<ApiMetadataDataStandardEnum>;
  dataType: ApiMetadataDataTypeEnum;
  enabled?: InputMaybe<Scalars['Boolean']>;
  filterable?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
  label: Scalars['String'];
  model: ApiMetadataModelEnum;
  options?: InputMaybe<Scalars['String']>;
  type: ApiMetadataTypeEnum;
  urn?: InputMaybe<Scalars['String']>;
  validator?: InputMaybe<Scalars['String']>;
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled, filterable) */
export type MetadataInputPartial = {
  dataStandard?: InputMaybe<ApiMetadataDataStandardEnum>;
  dataType?: InputMaybe<ApiMetadataDataTypeEnum>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  filterable?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['GlobalID'];
  label?: InputMaybe<Scalars['String']>;
  model?: InputMaybe<ApiMetadataModelEnum>;
  options?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<ApiMetadataTypeEnum>;
  urn?: InputMaybe<Scalars['String']>;
  validator?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addDataset: AddDatasetPayload;
  addUpdateDatasetMetadata: AddUpdateDatasetMetadataPayload;
  createAccessModel: CreateAccessModelPayload;
  createCategory: TypeCategory;
  createFileResources: Array<TypeResource>;
  createMetadata: TypeMetadata;
  deleteAccessModel: Scalars['Boolean'];
  deleteCategory: TypeCategory;
  deleteDataset: Scalars['Boolean'];
  deleteFileResource: Scalars['Boolean'];
  deleteMetadata: TypeMetadata;
  editAccessModel: EditAccessModelPayload;
  publishDataset: PublishDatasetPayload;
  resetFileResourceSchema: ResetFileResourceSchemaPayload;
  updateCategory: TypeCategory;
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


export type MutationCreateCategoryArgs = {
  data: CategoryInput;
};


export type MutationCreateFileResourcesArgs = {
  fileResourceInput: CreateFileResourceInput;
};


export type MutationCreateMetadataArgs = {
  data: MetadataInput;
};


export type MutationDeleteAccessModelArgs = {
  accessModelId: Scalars['UUID'];
};


export type MutationDeleteCategoryArgs = {
  data: NodeInput;
};


export type MutationDeleteDatasetArgs = {
  datasetId: Scalars['UUID'];
};


export type MutationDeleteFileResourceArgs = {
  resourceId: Scalars['UUID'];
};


export type MutationDeleteMetadataArgs = {
  data: NodeInput;
};


export type MutationEditAccessModelArgs = {
  accessModelInput: EditAccessModelInput;
};


export type MutationPublishDatasetArgs = {
  datasetId: Scalars['UUID'];
};


export type MutationResetFileResourceSchemaArgs = {
  resourceId: Scalars['UUID'];
};


export type MutationUpdateCategoryArgs = {
  data: CategoryInputPartial;
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
  categories: Array<TypeCategory>;
  datasetResources: Array<TypeResource>;
  datasets: Array<TypeDataset>;
  metadata: Array<TypeMetadata>;
  resource: Array<TypeResource>;
  tags: Array<TypeTag>;
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


export type QueryMetadataArgs = {
  filters?: InputMaybe<MetadataFilter>;
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
  type: ApiAccessModelTypeEnum;
};

/** AccessModelResource(id, access_model, resource) */
export type TypeAccessModelResource = {
  __typename?: 'TypeAccessModelResource';
  accessModel: DjangoModelType;
  fields: Array<TypeResourceSchema>;
  id: Scalars['ID'];
  resource: TypeResource;
};

/** AccessModelResource(id, access_model, resource) */
export type TypeAccessModelResourceFields = {
  __typename?: 'TypeAccessModelResourceFields';
  fields: Array<TypeResourceSchema>;
};

/** Category(id, name, description, parent_id) */
export type TypeCategory = {
  __typename?: 'TypeCategory';
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentId?: Maybe<TypeCategory>;
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
  status: ApiDatasetStatusEnum;
  tags: Array<TypeTag>;
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
  dataStandard: ApiMetadataDataStandardEnum;
  dataType: ApiMetadataDataTypeEnum;
  enabled: Scalars['Boolean'];
  filterable: Scalars['Boolean'];
  id: Scalars['ID'];
  label: Scalars['String'];
  model: ApiMetadataModelEnum;
  options: Scalars['String'];
  type: ApiMetadataTypeEnum;
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
  type: ApiResourceTypeEnum;
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
  type: ApiAccessModelTypeEnum;
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
  format: ApiResourceSchemaFormatEnum;
  id: Scalars['ID'];
  resource: DjangoModelType;
};

/** Tag(id, value) */
export type TypeTag = {
  __typename?: 'TypeTag';
  id: Scalars['ID'];
  value: Scalars['String'];
};

export type UpdateDatasetInput = {
  dataset: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  tags: Array<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
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

export type AccessModelResourceQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type AccessModelResourceQuery = { __typename?: 'Query', accessModelResources: Array<{ __typename?: 'TypeAccessModel', id: any, name: string, description: string, type: ApiAccessModelTypeEnum, created: any, modified: any, modelResources: Array<{ __typename?: 'TypeAccessModelResource', resource: { __typename?: 'TypeResource', name: string, description: string, id: any }, fields: Array<{ __typename?: 'TypeResourceSchema', fieldName: string, format: ApiResourceSchemaFormatEnum, id: string }> }> }> };

export type DatasetResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type DatasetResourcesQuery = { __typename?: 'Query', datasetResources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: ApiResourceTypeEnum, name: string, description: string, accessModels: Array<{ __typename?: 'TypeResourceAccessModel', name: string, description: string, type: ApiAccessModelTypeEnum, modelResources: Array<{ __typename?: 'TypeAccessModelResourceFields', fields: Array<{ __typename?: 'TypeResourceSchema', format: ApiResourceSchemaFormatEnum, fieldName: string, description?: string | null }> }> }>, schema?: Array<{ __typename?: 'TypeResourceSchema', fieldName: string, id: string, format: ApiResourceSchemaFormatEnum, description?: string | null }> | null }> };

export type DatasetsQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetsQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', id: any, title: string, description: string, created: any, modified: any, tags: Array<{ __typename?: 'TypeTag', id: string, value: string }>, metadata: Array<{ __typename?: 'TypeDatasetMetadata', value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }>, resources: Array<{ __typename?: 'TypeResource', id: any, created: any, modified: any, type: ApiResourceTypeEnum, name: string, description: string }> }> };

export type ResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type ResourcesQuery = { __typename?: 'Query', datasetResources: Array<{ __typename?: 'TypeResource', id: any, type: ApiResourceTypeEnum, name: string, description: string, schema?: Array<{ __typename?: 'TypeResourceSchema', id: string, fieldName: string }> | null }> };

export type CreateAccessModelMutationVariables = Exact<{
  accessModelInput: AccessModelInput;
}>;


export type CreateAccessModelMutation = { __typename?: 'Mutation', createAccessModel: { __typename: 'OperationInfo' } | { __typename: 'TypeAccessModel', id: any, description: string, name: string, type: ApiAccessModelTypeEnum } };

export type AccessModelResourcesQueryVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type AccessModelResourcesQuery = { __typename?: 'Query', accessModelResources: Array<{ __typename?: 'TypeAccessModel', id: any, name: string, description: string, type: ApiAccessModelTypeEnum, created: any, modified: any, modelResources: Array<{ __typename?: 'TypeAccessModelResource', resource: { __typename?: 'TypeResource', name: string, description: string, id: any } }> }> };

export type GetResourcesQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type GetResourceQuery = { __typename?: 'Query', resource: Array<{ __typename?: 'TypeResource', id: any, type: ApiResourceTypeEnum, name: string, description: string, created: any, dataset?: { __typename?: 'DjangoModelType', pk: string } | null, fileDetails?: { __typename?: 'TypeFileDetails', id: string, size?: number | null, created: any, modified: any, resource: { __typename?: 'DjangoModelType', pk: string }, file: { __typename?: 'DjangoFileType', name: string, path: string, url: string } } | null }> };

export type ReadFilesMutationVariables = Exact<{
  fileResourceInput: CreateFileResourceInput;
}>;


export type ReadFilesMutation = { __typename?: 'Mutation', createFileResources: Array<{ __typename?: 'TypeResource', id: any, created: any, name: string }> };

export type DatasetTitleQueryQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetTitleQueryQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', id: any, title: string, created: any }> };

export type SaveTitleMutationVariables = Exact<{
  updateDatasetInput: UpdateDatasetInput;
}>;


export type SaveTitleMutation = { __typename?: 'Mutation', updateDataset: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, title: string, created: any } };

export type MetaDataQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MetaDataQueryQuery = { __typename?: 'Query', metadata: Array<{ __typename?: 'TypeMetadata', id: string, label: string, dataStandard: ApiMetadataDataStandardEnum, urn: string, dataType: ApiMetadataDataTypeEnum, options: string, validator: string, type: ApiMetadataTypeEnum, model: ApiMetadataModelEnum, enabled: boolean }> };

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

export type DatasetDetailsQueryQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetDetailsQueryQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', id: any, title: string, metadata: Array<{ __typename?: 'TypeDatasetMetadata', id: string, value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }> }> };

export type MetaDataQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MetaDataQueryQuery = { __typename?: 'Query', metadata: Array<{ __typename?: 'TypeMetadata', id: string, label: string, dataStandard: ApiMetadataDataStandardEnum, urn: string, dataType: ApiMetadataDataTypeEnum, options: string, validator: string, type: ApiMetadataTypeEnum, model: ApiMetadataModelEnum, enabled: boolean, filterable: boolean }> };

export type DatasetsSummaryQueryVariables = Exact<{
  filters?: InputMaybe<DatasetFilter>;
}>;


export type DatasetsSummaryQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'TypeDataset', id: any, title: string, description: string, created: any, modified: any, metadata: Array<{ __typename?: 'TypeDatasetMetadata', id: string, value: string, metadataItem: { __typename?: 'TypeMetadata', id: string, label: string } }>, resources: Array<{ __typename?: 'TypeResource', id: any, type: ApiResourceTypeEnum, name: string, description: string, schema?: Array<{ __typename?: 'TypeResourceSchema', fieldName: string, id: string, format: ApiResourceSchemaFormatEnum, description?: string | null }> | null }>, accessModels: Array<{ __typename?: 'TypeAccessModel', id: any, name: string, description: string, type: ApiAccessModelTypeEnum, created: any, modified: any, modelResources: Array<{ __typename?: 'TypeAccessModelResource', resource: { __typename?: 'TypeResource', name: string, description: string, id: any, type: ApiResourceTypeEnum } }> }>, tags: Array<{ __typename?: 'TypeTag', id: string, value: string }> }> };

export type PublishDatasetMutationVariables = Exact<{
  datasetId: Scalars['UUID'];
}>;


export type PublishDatasetMutation = { __typename?: 'Mutation', publishDataset: { __typename?: 'OperationInfo' } | { __typename?: 'TypeDataset', id: any, status: ApiDatasetStatusEnum } };

export type GenerateDatasetNameMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateDatasetNameMutation = { __typename?: 'Mutation', addDataset: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, created: any } };


export const AccessModelResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"accessModelResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessModelResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<AccessModelResourceQuery, AccessModelResourceQueryVariables>;
export const DatasetResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasetResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"accessModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"modelResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetResourcesQuery, DatasetResourcesQueryVariables>;
export const DatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetsQuery, DatasetsQueryVariables>;
export const ResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"resources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasetResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldName"}}]}}]}}]}}]} as unknown as DocumentNode<ResourcesQuery, ResourcesQueryVariables>;
export const CreateAccessModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAccessModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accessModelInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccessModelInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccessModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accessModelInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accessModelInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeAccessModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<CreateAccessModelMutation, CreateAccessModelMutationVariables>;
export const AccessModelResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"accessModelResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessModelResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<AccessModelResourcesQuery, AccessModelResourcesQueryVariables>;
export const GetResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"fileDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetResourcesQuery, GetResourcesQueryVariables>;
export const ReadFilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"readFiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFileResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFileResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileResourceInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ReadFilesMutation, ReadFilesMutationVariables>;
export const DatasetTitleQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetTitleQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}}]}}]} as unknown as DocumentNode<DatasetTitleQueryQuery, DatasetTitleQueryQueryVariables>;
export const SaveTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updateDatasetInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDatasetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"updateDatasetInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updateDatasetInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SaveTitleMutation, SaveTitleMutationVariables>;
export const UpdateFileResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateFileResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFileResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFileResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileResourceInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileResourceInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeResource"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateFileResourceMutation, UpdateFileResourceMutationVariables>;
export const DeleteFileResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteFileResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFileResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}}]}]}}]} as unknown as DocumentNode<DeleteFileResourceMutation, DeleteFileResourceMutationVariables>;
export const DatasetQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetQueryQuery, DatasetQueryQueryVariables>;
export const DatasetsSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"datasetsSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"resources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"modelResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<DatasetsSummaryQuery, DatasetsSummaryQueryVariables>;
export const PublishDatasetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"publishDataset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"datasetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PublishDatasetMutation, PublishDatasetMutationVariables>;
export const GenerateDatasetNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateDatasetName"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addDataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GenerateDatasetNameMutation, GenerateDatasetNameMutationVariables>;