import React from 'react';
import { type TypedDocumentNode } from '@graphql-typed-document-node/core';
import { QueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getServerSession, type Session } from 'next-auth';
import { getSession } from 'next-auth/react';

function assertGraphqlDocument(document: unknown) {
  if (typeof document === 'string' && document.trim()) return;
  if (
    document &&
    typeof document === 'object' &&
    Array.isArray((document as { definitions?: unknown }).definitions)
  ) {
    return;
  }

  throw new Error(
    'Invalid GraphQL document. The query is missing from gql/generated — run `npm run generate`.'
  );
}

async function getGraphqlSession(): Promise<Session | null> {
  if (typeof window === 'undefined') {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    return getServerSession(authOptions);
  }

  return getSession();
}

export async function GraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  entityHeaders: Record<string, string> = {},
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  assertGraphqlDocument(document);
  const session = await getGraphqlSession();

  const headers = {
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
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
  assertGraphqlDocument(document);

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
  assertGraphqlDocument(document);

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
