import { graphql } from '@/gql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import gql from 'graphql-tag';

function operation<TData, TVariables extends Record<string, unknown>>(
  source: string
) {
  return gql(source) as TypedDocumentNode<TData, TVariables>;
}

export type EditorBlock = {
  id: string;
  position: number;
  blockType: string;
  title?: string | null;
  description?: string | null;
  fileName?: string | null;
  fileFormat?: string | null;
  fileSize?: number | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  created?: string | null;
};

export type EditorPublication = {
  id: string;
  title?: string | null;
  description?: string | null;
  authors?: Array<string> | null;
  publicationDate?: string | null;
  license?: string | null;
  externalSourceLink?: string | null;
  status?: string | null;
  resourceType?: { id: string; name: string } | null;
  sectors?: Array<{ id: string; name: string }> | null;
  geographies?: Array<{ id: string | number; name: string }> | null;
  blocks?: Array<EditorBlock> | null;
};

export const publicationListQuery = graphql(`
  query dashboardPublications($pagination: OffsetPaginationInput) {
    publications(pagination: $pagination) {
      id
      title
      status
      created
      modified
    }
  }
`);

export const publicationEditorQuery = operation<
  { getPublication?: EditorPublication | null },
  { publicationId: string }
>(`
  query publicationEditor($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      id
      title
      description
      authors
      publicationDate
      license
      externalSourceLink
      status
      resourceType {
        id
        name
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      blocks {
        id
        position
        blockType
        title
        description
        fileName
        fileFormat
        fileSize
        youtubeUrl
        youtubeVideoId
        created
      }
    }
  }
`);

export const publicationReferenceQuery = graphql(`
  query publicationFormReferenceData {
    resourceTypes {
      id
      name
    }
    sectors {
      id
      name
    }
    geographies {
      id
      name
    }
  }
`);

export const createPublicationMutation = graphql(`
  mutation createPublicationWizard($input: CreatePublicationInput!) {
    createPublication(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
      }
    }
  }
`);

export const updatePublicationMutation = graphql(`
  mutation updatePublicationWizard($input: UpdatePublicationInput!) {
    updatePublication(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        title
      }
    }
  }
`);

export const deletePublicationMutation = graphql(`
  mutation deletePublicationWizard($publicationId: UUID!) {
    deletePublication(publicationId: $publicationId) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);

export const publishPublicationMutation = operation<
  {
    publishPublication?: {
      success?: boolean | null;
      errors?: {
        nonFieldErrors?: Array<string | null> | null;
        fieldErrors?: Array<{
          messages?: Array<string | null> | null;
        } | null> | null;
      } | null;
      data?: { id: string; status?: string | null } | null;
    } | null;
  },
  { publicationId: string }
>(`
  mutation publishPublicationWizard($publicationId: UUID!) {
    publishPublication(publicationId: $publicationId) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        status
      }
    }
  }
`);

export const unpublishPublicationMutation = graphql(`
  mutation unpublishPublicationWizard($publicationId: UUID!) {
    unpublishPublication(publicationId: $publicationId) {
      success
      errors {
        nonFieldErrors
      }
      data {
        id
        status
      }
    }
  }
`);

export const addPublicationFileMutation = operation<
  {
    addPublicationFileBlock?: {
      success?: boolean | null;
      errors?: {
        nonFieldErrors?: Array<string | null> | null;
        fieldErrors?: Array<{
          messages?: Array<string | null> | null;
        } | null> | null;
      } | null;
      data?: { id: string } | null;
    } | null;
  },
  {
    publicationId: string;
    file: File;
    title?: string | null;
    description?: string | null;
  }
>(`
  mutation addPublicationFileBlockWizard(
    $publicationId: UUID!
    $file: Upload!
    $title: String
    $description: String
  ) {
    addPublicationFileBlock(
      publicationId: $publicationId
      file: $file
      title: $title
      description: $description
    ) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          messages
        }
      }
      data {
        id
      }
    }
  }
`);

export const addPublicationYoutubeMutation = operation<
  {
    addPublicationYoutubeBlock?: {
      success?: boolean | null;
      errors?: {
        nonFieldErrors?: Array<string | null> | null;
        fieldErrors?: Array<{
          messages?: Array<string | null> | null;
        } | null> | null;
      } | null;
    } | null;
  },
  {
    publicationId: string;
    youtubeUrl: string;
    title?: string | null;
    description?: string | null;
  }
>(`
  mutation addPublicationYoutubeBlockWizard(
    $publicationId: UUID!
    $youtubeUrl: String!
    $title: String
    $description: String
  ) {
    addPublicationYoutubeBlock(
      publicationId: $publicationId
      youtubeUrl: $youtubeUrl
      title: $title
      description: $description
    ) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          messages
        }
      }
    }
  }
`);

export const updatePublicationBlockMutation = operation<
  {
    updatePublicationBlock?: {
      success?: boolean | null;
      errors?: {
        nonFieldErrors?: Array<string | null> | null;
        fieldErrors?: Array<{
          messages?: Array<string | null> | null;
        } | null> | null;
      } | null;
    } | null;
  },
  { blockId: string; title?: string | null; description?: string | null }
>(`
  mutation updatePublicationBlockWizard(
    $blockId: UUID!
    $title: String
    $description: String
  ) {
    updatePublicationBlock(
      blockId: $blockId
      title: $title
      description: $description
    ) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          messages
        }
      }
    }
  }
`);

export const removePublicationBlockMutation = graphql(`
  mutation removePublicationBlockWizard($blockId: UUID!) {
    removePublicationBlock(blockId: $blockId) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);

export const reorderPublicationBlocksMutation = graphql(`
  mutation reorderPublicationBlocksWizard(
    $publicationId: UUID!
    $blockIds: [UUID!]!
  ) {
    reorderPublicationBlocks(
      publicationId: $publicationId
      blockIds: $blockIds
    ) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);
