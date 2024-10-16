import React from 'react';
import { type TypedDocumentNode } from '@graphql-typed-document-node/core';
import { QueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getSession } from 'next-auth/react';

import { gqlConfig } from '@/config/site';

// create a wrapper function for graphql-request
// that will be used by react-query

export async function GraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const session = await getSession();

  const headers = {
    ...gqlConfig.headers,
    ...(session ? { Authorization: session?.access_token } : {}),
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
