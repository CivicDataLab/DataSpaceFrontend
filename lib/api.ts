import React from 'react';
import { type TypedDocumentNode } from '@graphql-typed-document-node/core';
import { QueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';

// create a wrapper function for graphql-request
// that will be used by react-query

export async function GraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  entityHeaders: Record<string, string> = {},
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  // Try to get session - this works for server-side calls
  let session;
  try {
    session = await getServerSession();
  } catch {
    // Fallback for client-side calls
    session = await getSession();
  }

  const headers = {
    ...(session ? { Authorization: `Bearer ${session?.access_token}` } : {}),
    ...entityHeaders,
  };

  const data = await request(
    `${process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL}`,
    document,
    {
      ...variables,
    },
    headers
  );
  return data;
}

// Client-side specific GraphQL function for use with react-query
export async function GraphQLClient<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  entityHeaders: Record<string, string> = {},
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const session = await getSession();

  const headers = {
    ...(session ? { Authorization: `Bearer ${session?.access_token}` } : {}),
    ...entityHeaders,
  };

  const data = await request(
    `${process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL}`,
    document,
    {
      ...variables,
    },
    headers
  );
  return data;
}

// Public GraphQL function that doesn't require authentication
export async function GraphQLPublic<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  entityHeaders: Record<string, string> = {},
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const data = await request(
    `${process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL}`,
    document,
    {
      ...variables,
    },
    entityHeaders
  );
  return data;
}

// wrapper function for react-query to be used by server components
export const getQueryClient = React.cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    })
);
