import { DatasetLicense } from '@/gql/generated/graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useQuery } from '@tanstack/react-query';
import gql from 'graphql-tag';

import { GraphQL } from '@/lib/api';
import { datasetLicenseLabel } from '@/lib/datasetLicense';
import { enumValues } from '@/lib/enumValues';

type DatasetLicenseEnumResult = {
  __type?: { enumValues?: Array<{ name: string }> | null } | null;
};

const datasetLicenseEnumQuery = gql(`
  query DatasetLicenseEnum {
    __type(name: "DatasetLicense") {
      enumValues {
        name
      }
    }
  }
`) as TypedDocumentNode<DatasetLicenseEnumResult, Record<string, never>>;

export type LicenseOption = { label: string; value: string };

const toOptions = (names: string[]): LicenseOption[] =>
  names.map((name) => ({ label: datasetLicenseLabel(name), value: name }));

// Codegen values keep the dropdown populated while the query is in flight or
// if it fails, so a slow backend can't leave it empty.
const FALLBACK_LICENSES = toOptions(enumValues(DatasetLicense));

export const useDatasetLicenses = () => {
  const query = useQuery({
    queryKey: ['dataset_license_enum'],
    queryFn: () => GraphQL(datasetLicenseEnumQuery),
    staleTime: Infinity,
  });

  const names = query.data?.__type?.enumValues?.map((value) => value.name);
  const licenses = names?.length ? toOptions(names) : FALLBACK_LICENSES;

  return { licenses, isLoading: query.isLoading };
};
