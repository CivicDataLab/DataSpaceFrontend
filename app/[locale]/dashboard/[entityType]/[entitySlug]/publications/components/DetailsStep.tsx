'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { FetchUsers } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/[id]/contributors/query';
import { DatasetLicense } from '@/gql/generated/graphql';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Combobox,
  SectionCard,
  Select,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  EntityRowPicker,
  type EntityRow,
} from '../../usecases/edit/components/EntityRowPicker';
import styles from '../../usecases/edit/edit.module.scss';
import { usePublicationDraft } from '../context';
import {
  detailsErrors,
  emptyDetails,
  errorText,
  isDetailsComplete,
  isHttpUrl,
  LICENSE_OPTIONS,
  mutationMessage,
  publicationWriteInput,
  type DetailsDraft,
  type TagOption,
} from '../model';
import {
  addPublicationFileMutation,
  addPublicationYoutubeMutation,
  createPublicationMutation,
  publicationEditorQuery,
  publicationReferenceQuery,
  updatePublicationMutation,
} from '../queries';

function toTagOptions(value: string | TagOption[]): TagOption[] {
  return Array.isArray(value) ? value : [];
}

function fileUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${url.replace('/code/files/', '')}`;
}

export function DetailsStep({ publicationId }: { publicationId?: string }) {
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const headers = useMemo(
    () => ({ [params.entityType]: params.entitySlug }),
    [params.entityType, params.entitySlug]
  );
  const queryClient = useQueryClient();
  const draft = usePublicationDraft();
  const {
    details: draftDetails,
    setDetails: setDraftDetails,
    pendingBlocks,
    setPendingBlocks,
    showErrors,
    setShowErrors,
    setDetailsReady,
    setStatus,
    registerBeforeNavigateHandler,
  } = draft;

  const [editedForm, setEditedForm] = useState<{
    id: string;
    form: DetailsDraft;
  } | null>(null);
  const [userSearch, setUserSearch] = useState('');

  const editorQuery = useQuery(
    ['publication_editor', publicationId],
    () =>
      GraphQL(publicationEditorQuery, headers, {
        publicationId: publicationId ?? '',
      }),
    { enabled: Boolean(publicationId) }
  );

  const referenceQuery = useQuery(['publication_form_reference'], () =>
    GraphQL(publicationReferenceQuery, headers)
  );

  const usersQuery = useQuery(
    ['publication_contributor_search', userSearch],
    () => GraphQL(FetchUsers, headers, { limit: 8, searchTerm: userSearch }),
    { enabled: userSearch.trim().length > 0 }
  );

  const publication = editorQuery.data?.getPublication;
  const serverForm: DetailsDraft | null = publication
    ? {
        title: publication.title ?? '',
        description: publication.description ?? '',
        publicationDate: String(publication.publicationDate ?? '').slice(0, 10),
        license: publication.license ?? 'CC_BY_4_0_ATTRIBUTION',
        resourceTypeId: publication.resourceType?.id ?? '',
        sectors: (publication.sectors ?? []).map((sector) => ({
          label: sector.name,
          value: sector.id,
        })),
        geographies: (publication.geographies ?? []).map((geography) => ({
          label: geography.name,
          value: String(geography.id),
        })),
        externalSourceLink: publication.externalSourceLink ?? '',
        contributors: (publication.authors ?? []).map((name, index) => ({
          id: `author-${index}-${name}`,
          name,
        })),
      }
    : null;
  const form = publicationId
    ? editedForm?.id === publicationId
      ? editedForm.form
      : (serverForm ?? emptyDetails())
    : draftDetails;
  const formRef = useRef(form);
  const pendingRef = useRef(pendingBlocks);
  const editedRef = useRef(false);
  const saveChain = useRef(Promise.resolve());

  useEffect(() => {
    editedRef.current = false;
  }, [publicationId]);

  useEffect(() => {
    pendingRef.current = pendingBlocks;
  }, [pendingBlocks]);

  useEffect(() => {
    if (!editedRef.current) formRef.current = form;
    setDetailsReady(isDetailsComplete(formRef.current));
  }, [form, setDetailsReady]);

  const updateForm = (patch: Partial<DetailsDraft>) => {
    // Merge onto the ref, not the last render. A date picker and Continue
    // happen in one turn, and a second edit would otherwise replace the
    // contributor list with the previous form.
    const next = { ...formRef.current, ...patch };
    editedRef.current = true;
    formRef.current = next;
    setDetailsReady(isDetailsComplete(next));
    if (publicationId) {
      setEditedForm({ id: publicationId, form: next });
      return next;
    }
    setDraftDetails(next);
    return next;
  };

  const persist = useCallback(() => {
    const run = saveChain.current
      .catch(() => undefined)
      .then(async () => {
        const current = formRef.current;
        if (
          current.externalSourceLink.trim() &&
          !isHttpUrl(current.externalSourceLink)
        ) {
          setShowErrors(true);
          toast('Enter a valid URL.');
          throw new Error('invalid');
        }

        const written = publicationWriteInput(current);
        const input = {
          ...written,
          license: (written.license || null) as DatasetLicense | null,
        };

        setStatus('loading');
        let id = publicationId;
        if (!id) {
          const created = await GraphQL(createPublicationMutation, headers, {
            input,
          });
          const message = mutationMessage(
            created.createPublication,
            'Could not create the publication.'
          );
          if (message || !created.createPublication?.data?.id) {
            throw new Error(message || 'Could not create the publication.');
          }
          id = created.createPublication.data.id;
        } else {
          const updated = await GraphQL(updatePublicationMutation, headers, {
            input: { id, ...input },
          });
          const message = mutationMessage(
            updated.updatePublication,
            'Could not save changes.'
          );
          if (message) throw new Error(message);
        }

        setStatus('success');
        toast('Publication updated successfully', {
          id: 'publication-save-success',
        });
        await queryClient.invalidateQueries({
          queryKey: ['publication_editor', id],
        });
        return id;
      });
    saveChain.current = run.then(
      () => undefined,
      () => undefined
    );
    return run.catch((error: unknown) => {
      setStatus('unsaved');
      if (error instanceof Error && error.message === 'invalid') throw error;
      toast(errorText(error, 'Could not save the publication.'));
      throw error;
    });
  }, [headers, publicationId, queryClient, setShowErrors, setStatus]);

  const saveNow = () => {
    void persist().catch(() => undefined);
  };

  useEffect(() => {
    registerBeforeNavigateHandler(async () => {
      const id = await persist();
      if (!id) throw new Error('Could not save the publication.');

      try {
        const queued = [...pendingRef.current];
        for (const block of queued) {
          if (block.kind === 'file') {
            const uploaded = await GraphQL(
              addPublicationFileMutation,
              headers,
              {
                publicationId: id,
                file: block.file,
                title: block.title,
                description: block.description || null,
              }
            );
            const message = mutationMessage(
              uploaded.addPublicationFileBlock,
              `${block.file.name} could not be uploaded.`
            );
            if (message) throw new Error(message);
          } else {
            const uploaded = await GraphQL(
              addPublicationYoutubeMutation,
              headers,
              {
                publicationId: id,
                youtubeUrl: block.url,
                title: block.title || null,
                description: block.description || null,
              }
            );
            const message = mutationMessage(
              uploaded.addPublicationYoutubeBlock,
              'A YouTube video could not be saved.'
            );
            if (message) throw new Error(message);
          }
          setPendingBlocks((items) =>
            items.filter((item) => item.id !== block.id)
          );
        }
      } catch (error) {
        setStatus('unsaved');
        toast(errorText(error, 'Some files could not be uploaded.'));
        await queryClient.invalidateQueries({
          queryKey: ['publication_editor', id],
        });
        return { id, step: 1 };
      }

      setStatus('success');
      setShowErrors(false);
      await queryClient.invalidateQueries({
        queryKey: ['publication_editor', id],
      });
      return { id };
    });
    return () => registerBeforeNavigateHandler(null);
  }, [
    persist,
    headers,
    queryClient,
    registerBeforeNavigateHandler,
    setPendingBlocks,
    setShowErrors,
  ]);

  if (publicationId && editorQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const errors = showErrors ? detailsErrors(form) : {};
  const resourceTypes =
    referenceQuery.data?.resourceTypes?.map((item) => ({
      label: item.name,
      value: item.id,
    })) ?? [];
  const sectorOptions =
    referenceQuery.data?.sectors?.map((item) => ({
      label: item.name,
      value: item.id,
    })) ?? [];
  const geographyOptions =
    referenceQuery.data?.geographies?.map((item) => ({
      label: item.name,
      value: String(item.id),
    })) ?? [];

  const selectedContributors: EntityRow[] = form.contributors.map((item) => ({
    id: item.id,
    title: item.name,
    subtitle: item.username,
    imageUrl: item.imageUrl,
  }));
  const contributorOptions: EntityRow[] =
    usersQuery.data?.searchUsers?.map((item) => ({
      id: item.id,
      title: item.fullName,
      subtitle: item.username,
      imageUrl: fileUrl(item.profilePicture?.url) || undefined,
    })) ?? [];

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard title="Basic Information">
        <div className="flex flex-col gap-5">
          <TextField
            name="resourceName"
            label="Resource Name"
            required
            requiredIndicator
            value={form.title}
            error={errors.title}
            onChange={(value) => updateForm({ title: value })}
            onBlur={saveNow}
          />
          <TextField
            name="description"
            label="Description / Abstract"
            required
            requiredIndicator
            multiline={4}
            value={form.description}
            error={errors.description}
            onChange={(value) => updateForm({ description: value })}
            onBlur={saveNow}
          />
          <TextField
            name="publicationDate"
            label="Date"
            type="date"
            required
            requiredIndicator
            value={form.publicationDate}
            error={errors.publicationDate}
            onChange={(value) => {
              updateForm({ publicationDate: value });
              saveNow();
            }}
          />
          <TextField
            name="externalSourceLink"
            label="External Source Link"
            value={form.externalSourceLink}
            error={
              errors.externalSourceLink ||
              (form.externalSourceLink && !isHttpUrl(form.externalSourceLink)
                ? 'Enter a valid URL.'
                : undefined)
            }
            placeholder="https://"
            onChange={(value) => updateForm({ externalSourceLink: value })}
            onBlur={saveNow}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Contributors"
        description="Add the people involved in creating this content."
      >
        <EntityRowPicker
          variant="person"
          searchPlaceholder="Search contributors..."
          emptyTitle="No contributors added yet."
          options={contributorOptions}
          selected={selectedContributors}
          isLoading={userSearch.trim().length > 0 && usersQuery.isFetching}
          onSearch={setUserSearch}
          onAdd={(item) => {
            const current = formRef.current.contributors;
            if (current.some((contributor) => contributor.id === item.id)) {
              return;
            }
            updateForm({
              contributors: [
                ...current,
                {
                  id: item.id,
                  name: item.title,
                  username: item.subtitle,
                  imageUrl: item.imageUrl || undefined,
                },
              ],
            });
            saveNow();
          }}
          onRemove={(id) => {
            updateForm({
              contributors: formRef.current.contributors.filter(
                (contributor) => contributor.id !== id
              ),
            });
            saveNow();
          }}
        />
        {errors.contributors ? (
          <div className="mt-2">
            <Text variant="bodySm" className="text-textCritical">
              {errors.contributors}
            </Text>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Classification" className={styles.overflowVisible}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Select
              name="resourceType"
              label="Resource Type"
              required
              requiredIndicator
              options={resourceTypes}
              placeholder="Select"
              value={form.resourceTypeId}
              error={errors.resourceTypeId}
              onChange={(value) => {
                updateForm({ resourceTypeId: value });
                saveNow();
              }}
            />
            <Select
              name="usageRights"
              label="Usage Rights"
              required
              requiredIndicator
              options={LICENSE_OPTIONS}
              placeholder="Select"
              value={form.license}
              error={errors.license}
              onChange={(value) => {
                updateForm({ license: value });
                saveNow();
              }}
            />
          </div>
          <Combobox
            key={`sectors-${sectorOptions.length}-${(form.sectors ?? []).length}`}
            displaySelected
            name="sectors"
            label="Sector / Domain"
            required
            requiredIndicator
            variant="bright"
            placeholder="Select sectors..."
            list={sectorOptions}
            selectedValue={form.sectors ?? []}
            error={errors.sectors}
            onChange={(value) => {
              updateForm({ sectors: toTagOptions(value) });
              saveNow();
            }}
          />
          <Combobox
            key={`geographies-${geographyOptions.length}-${(form.geographies ?? []).length}`}
            displaySelected
            name="geographies"
            label="Geography"
            required
            requiredIndicator
            variant="bright"
            placeholder="Select geographies..."
            list={geographyOptions}
            selectedValue={form.geographies ?? []}
            error={errors.geographies}
            onChange={(value) => {
              updateForm({ geographies: toTagOptions(value) });
              saveNow();
            }}
          />
        </div>
      </SectionCard>
    </div>
  );
}
