import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import gql from 'graphql-tag';

function operation<TData, TVariables extends Record<string, unknown>>(
  source: string
) {
  return gql(source) as TypedDocumentNode<TData, TVariables>;
}

export type PublicEvent = {
  id: string;
  name?: string | null;
  urlSlug?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  lumaEmbed?: { src: string } | null;
  organization?: {
    id: string;
    name: string;
    slug?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
  user?: {
    id: string;
    fullName?: string | null;
    username?: string | null;
    profilePicture?: { url?: string | null } | null;
  } | null;
};

export const eventBySlugQuery = operation<
  { eventBySlug?: PublicEvent | null },
  { publicId: string }
>(`
  query EventBySlug($publicId: String!) {
    eventBySlug(publicId: $publicId) {
      id
      name
      urlSlug
      location
      startDate
      endDate
      lumaEmbed { src }
      organization { id name slug logo { url } }
      user { id fullName username profilePicture { url } }
    }
  }
`);
