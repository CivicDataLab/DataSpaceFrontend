'use client';

import { useState } from 'react';
import { SectionCard } from 'opub-ui';

import { AddNewEntryDialog } from './AddNewEntryDialog';
import { EntityRowPicker, type EntityRow } from './EntityRowPicker';

export const PEOPLE_ORG_RELATIONSHIPS = [
  { label: 'Contributor', value: 'contributor' },
  { label: 'Partner', value: 'partner' },
  { label: 'Supporter', value: 'supporter' },
];

export function peopleOrgRoleMessage(item: EntityRow, role: string) {
  if (item.kind === 'person') return 'People are added as contributors.';
  if (role === 'contributor') {
    return 'Organisations can be partners or supporters.';
  }
  return null;
}

export function rawEntityId(id: string) {
  return id.replace(/^(user|org):/, '');
}

export function personSubtitle(
  memberships?: Array<{
    role?: { name?: string | null } | null;
    organization?: { name?: string | null } | null;
  } | null> | null
) {
  const list = memberships?.filter((item) => item != null) ?? [];
  const role = list
    .map((item) => item.role?.name?.trim())
    .find((name) => name);
  if (role) return role;
  return (
    list.map((item) => item.organization?.name?.trim()).find((name) => name) ||
    undefined
  );
}

interface PeopleOrganisationsSectionProps {
  subject: string;
  className?: string;
  options: EntityRow[];
  selected: EntityRow[];
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onAdd: (item: EntityRow) => void;
  onRemove: (id: string) => void;
  onRoleChange: (item: EntityRow, role: string) => void;
  onAddOrganisation: () => void;
}

export function PeopleOrganisationsSection({
  subject,
  className,
  options,
  selected,
  isLoading,
  onSearch,
  onAdd,
  onRemove,
  onRoleChange,
  onAddOrganisation,
}: PeopleOrganisationsSectionProps) {
  const [chooserOpen, setChooserOpen] = useState(false);

  return (
    <>
      <SectionCard
        className={className}
        title="People & Organisations"
        description={`Add the people and organisations involved in this ${subject}.`}
        actions={[
          {
            kind: 'neutral',
            content: '+ Add New',
            onAction: () => setChooserOpen(true),
          },
        ]}
      >
        <div id="people">
          <EntityRowPicker
            variant="person"
            searchPlaceholder="Search people or organisations..."
            emptyTitle="People and organisations will appear here."
            emptyDescription="Search CivicDataSpace, or use Add New for someone who isn't listed yet."
            options={options}
            selected={selected}
            isLoading={isLoading}
            onSearch={onSearch}
            roleOptionsFor={() => PEOPLE_ORG_RELATIONSHIPS}
            onRoleChange={onRoleChange}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
      </SectionCard>
      <AddNewEntryDialog
        open={chooserOpen}
        subject={subject}
        onOpenChange={setChooserOpen}
        onContinue={(kind) => {
          setChooserOpen(false);
          if (kind === 'organisation') onAddOrganisation();
        }}
      />
    </>
  );
}
