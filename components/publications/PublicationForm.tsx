'use client';

import React, { useState } from 'react';
import { graphql } from '@/gql';
import { DatasetLicense } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Button, Combobox, FormLayout, Select, TextField } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RESOURCE_LABEL } from '@/lib/constants/resourceLabel';

// The controlled license vocabulary, shared with datasets.
const LICENSE_OPTIONS = [
  { label: 'CC BY 4.0 (Attribution)', value: 'CC_BY_4_0_ATTRIBUTION' },
  {
    label: 'CC BY-SA 4.0 (Attribution, ShareAlike)',
    value: 'CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE',
  },
  {
    label: 'Government Open Data License',
    value: 'GOVERNMENT_OPEN_DATA_LICENSE',
  },
  {
    label: 'Open Data Commons (Attribution)',
    value: 'OPEN_DATA_COMMONS_BY_ATTRIBUTION',
  },
  { label: 'Open Database License', value: 'OPEN_DATABASE_LICENSE' },
];

const referenceQuery = graphql(`
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

export type PublicationFormValues = {
  title: string;
  description: string;
  authors: string;
  publicationDate: string;
  license: string;
  resourceTypeId: string;
  sectorIds: string[];
  geographyIds: string[];
  externalSourceLink: string;
};

export type PublicationFormInput = {
  title: string;
  description: string;
  authors: string[];
  publicationDate: string;
  license: DatasetLicense;
  resourceTypeId: string;
  sectorIds: string[];
  geographyIds: number[];
  externalSourceLink?: string;
};

const EMPTY: PublicationFormValues = {
  title: '',
  description: '',
  authors: '',
  publicationDate: '',
  license: 'CC_BY_4_0_ATTRIBUTION',
  resourceTypeId: '',
  sectorIds: [],
  geographyIds: [],
  externalSourceLink: '',
};

/** Turn the form's string fields into the GraphQL input shape. */
function toInput(values: PublicationFormValues): PublicationFormInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    authors: values.authors
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
    publicationDate: values.publicationDate,
    license: values.license as DatasetLicense,
    resourceTypeId: values.resourceTypeId,
    sectorIds: values.sectorIds,
    geographyIds: values.geographyIds.map((id) => parseInt(id, 10)),
    externalSourceLink: values.externalSourceLink.trim() || undefined,
  };
}

/**
 * The typed metadata form for a Resource — used by both create and edit. It's a
 * normal form (title, abstract, authors, date, license, resource type, sectors,
 * geographies, external link), NOT the dynamic-metadata renderer datasets use.
 */
export function PublicationForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  initialValues?: Partial<PublicationFormValues>;
  onSubmit: (input: PublicationFormInput) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState<PublicationFormValues>({
    ...EMPTY,
    ...initialValues,
  });

  const { data } = useQuery(['publication_form_reference'], () =>
    GraphQL(referenceQuery, {})
  );

  const set = <K extends keyof PublicationFormValues>(
    key: K,
    value: PublicationFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const resourceTypeOptions =
    data?.resourceTypes?.map((t) => ({ label: t.name, value: t.id })) ?? [];
  const sectorList =
    data?.sectors?.map((s) => ({ label: s.name, value: s.id })) ?? [];
  const geographyList =
    data?.geographies?.map((g) => ({ label: g.name, value: String(g.id) })) ??
    [];

  return (
    <div className="flex flex-col gap-4 py-6">
      <TextField
        name="title"
        label={`${RESOURCE_LABEL} Title`}
        value={values.title}
        onChange={(v) => set('title', v)}
        required
        requiredIndicator
      />

      <Select
        name="resourceType"
        label={`${RESOURCE_LABEL} Type`}
        options={resourceTypeOptions}
        value={values.resourceTypeId}
        onChange={(v) => set('resourceTypeId', v)}
        required
        requiredIndicator
      />

      <TextField
        name="description"
        label="Abstract"
        value={values.description}
        onChange={(v) => set('description', v)}
        multiline={4}
        required
        requiredIndicator
      />

      <FormLayout>
        <FormLayout.Group>
          <TextField
            name="authors"
            label="Author(s)"
            helpText="Separate multiple authors with commas"
            value={values.authors}
            onChange={(v) => set('authors', v)}
            required
            requiredIndicator
          />
          <TextField
            name="publicationDate"
            label="Publication Date"
            type="date"
            value={values.publicationDate}
            onChange={(v) => set('publicationDate', v)}
            required
            requiredIndicator
          />
        </FormLayout.Group>
      </FormLayout>

      {/* opub-ui's Combobox multi-select passes/returns value-string arrays at
          runtime, but its declared types say string; cast at the boundary (the
          rest of the app uses `any` here). */}
      <Combobox
        displaySelected
        name="sectors"
        label="Sectors"
        list={sectorList}
        selectedValue={values.sectorIds as unknown as string}
        onChange={(v) => set('sectorIds', v as unknown as string[])}
        required
        requiredIndicator
      />

      <Combobox
        displaySelected
        name="geographies"
        label="Geographies"
        list={geographyList}
        selectedValue={values.geographyIds as unknown as string}
        onChange={(v) => set('geographyIds', v as unknown as string[])}
        required
        requiredIndicator
      />

      <Select
        name="license"
        label="Usage Rights (License)"
        options={LICENSE_OPTIONS}
        value={values.license}
        onChange={(v) => set('license', v)}
        required
        requiredIndicator
      />

      <TextField
        name="externalSourceLink"
        label="External Source Link (optional)"
        value={values.externalSourceLink}
        onChange={(v) => set('externalSourceLink', v)}
      />

      <div>
        <Button
          variant="interactive"
          loading={isSubmitting}
          onClick={() => onSubmit(toInput(values))}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
