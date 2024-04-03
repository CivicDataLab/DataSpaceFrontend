/* eslint-disable */
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
  UUID: any;
};

export type DjangoModelType = {
  __typename?: 'DjangoModelType';
  pk: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addDataset: TypeDataset;
};

export type Query = {
  __typename?: 'Query';
  geography: Array<TypeGeo>;
};

/** Dataset(id, title, organization, created, modified) */
export type TypeDataset = {
  __typename?: 'TypeDataset';
  created: Scalars['DateTime'];
  id: Scalars['UUID'];
  modified: Scalars['DateTime'];
  organization?: Maybe<DjangoModelType>;
  title: Scalars['String'];
};

/** Geography(id, name, code, type, parent_id) */
export type TypeGeo = {
  __typename?: 'TypeGeo';
  code?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentId?: Maybe<TypeGeo>;
  type: Scalars['String'];
};
