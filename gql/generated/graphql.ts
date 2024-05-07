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
};

export type AddDatasetPayload = OperationInfo | TypeDataset;

export type AddUpdateDatasetMetadataPayload = OperationInfo | TypeDataset;

export type DsMetadataItemType = {
  id: Scalars['String'];
  value: Scalars['String'];
};

export type DjangoModelType = {
  __typename?: 'DjangoModelType';
  pk: Scalars['ID'];
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled) */
export type MetadataInput = {
  dataStandard?: InputMaybe<Scalars['String']>;
  dataType: Scalars['String'];
  enabled?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
  label: Scalars['String'];
  model: Scalars['String'];
  options?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
  urn?: InputMaybe<Scalars['String']>;
  validator?: InputMaybe<Scalars['String']>;
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled) */
export type MetadataInputPartial = {
  dataStandard?: InputMaybe<Scalars['String']>;
  dataType?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
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
  createMetadata: TypeMetadata;
  deleteMetadata: TypeMetadata;
  updateMetadata: TypeMetadata;
};


export type MutationAddUpdateDatasetMetadataArgs = {
  updateMetadataInput: UpdateMetadataInput;
};


export type MutationCreateMetadataArgs = {
  data: MetadataInput;
};


export type MutationDeleteMetadataArgs = {
  data: NodeInput;
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
  dataset: Array<TypeDataset>;
  metadata: Array<TypeMetadata>;
};

/** Dataset(id, organization, created, modified) */
export type TypeDataset = {
  __typename?: 'TypeDataset';
  created: Scalars['DateTime'];
  id: Scalars['UUID'];
  metadata: Array<TypeDatasetMetadata>;
  modified: Scalars['DateTime'];
  organization?: Maybe<DjangoModelType>;
};

/** DatasetMetadata(id, dataset, metadata_item, value) */
export type TypeDatasetMetadata = {
  __typename?: 'TypeDatasetMetadata';
  dataset: DjangoModelType;
  id: Scalars['ID'];
  metadataItem: DjangoModelType;
  value: Scalars['String'];
};

/** Metadata(id, label, data_standard, urn, data_type, options, validator, type, model, enabled) */
export type TypeMetadata = {
  __typename?: 'TypeMetadata';
  dataStandard: Scalars['String'];
  dataType: Scalars['String'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  label: Scalars['String'];
  model: Scalars['String'];
  options: Scalars['String'];
  type: Scalars['String'];
  urn: Scalars['String'];
  validator: Scalars['String'];
};

export type UpdateMetadataInput = {
  dataset: Scalars['UUID'];
  metadata: Array<DsMetadataItemType>;
};

export type GetDatasetDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDatasetDataQuery = { __typename?: 'Query', dataset: Array<{ __typename?: 'TypeDataset', id: any, created: any, modified: any }> };

export type GenerateDatasetNameMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateDatasetNameMutation = { __typename?: 'Mutation', addDataset: { __typename: 'OperationInfo', messages: Array<{ __typename?: 'OperationMessage', kind: OperationMessageKind, message: string }> } | { __typename: 'TypeDataset', id: any, created: any } };


export const GetDatasetDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDatasetData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}}]}}]}}]} as unknown as DocumentNode<GetDatasetDataQuery, GetDatasetDataQueryVariables>;
export const GenerateDatasetNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateDatasetName"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addDataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TypeDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GenerateDatasetNameMutation, GenerateDatasetNameMutationVariables>;