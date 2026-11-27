import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PublicationStatus } from '@/gql/generated/graphql';

import { GraphQLPublic, nullIfMissing } from '@/lib/api';
import {
  datasetLicenseLabel,
  datasetLicenseTermsUrl,
} from '@/lib/datasetLicense';
import { uniqueNames } from '@/lib/public-entity';
import { isUuid, publicHref, publicPageUrl } from '@/lib/public-link';
import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import { PublicationCover } from './components/PublicationCover';
import { PublicationFiles } from './components/PublicationFiles';
import { PublicationInformation } from './components/PublicationInformation';
import {
  publicationCitation,
  publicationContributorNames,
  publicationIllustration,
  publicationMedia,
  publicationPublisher,
  publishedOn,
  type PublicationMediaItem,
} from './publication-detail';
import {
  publicationDetailsQuery,
  publicationLegacyMetaQuery,
  publicationMetaQuery,
} from './queries';

const BACK_HREF = '/publications';

type PageProps = { params: Promise<{ publicationSlug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicationSlug } = await params;
  const publication = isUuid(publicationSlug)
    ? null
    : (
        await GraphQLPublic(
          publicationMetaQuery,
          {},
          { publicId: publicationSlug }
        ).catch(() => null)
      )?.getPublication;

  if (!publication) {
    return generatePageMetadata({ title: 'Publication | CivicDataSpace' });
  }

  const url = publicPageUrl(
    'publications',
    publication.urlSlug || publicationSlug
  );
  const description =
    publication.description?.trim() ||
    `${publication.title}, a publication on CivicDataSpace.`;

  return {
    ...generatePageMetadata({
      title: `${publication.title} | Publications | CivicDataSpace`,
      description,
      keywords: [
        'Publication',
        'CivicDataSpace',
        ...publication.sectors.map((sector) => sector.name),
      ],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url,
        title: publication.title,
        description,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    }),
    alternates: { canonical: url },
  };
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const { publicationSlug } = await params;

  // Unknown publications come back as null and unpublished ones as a GraphQL
  // error; both are 404. An API outage still shows the error page.

  // Old links used the record's UUID; send them to the readable address.
  if (isUuid(publicationSlug)) {
    const legacy = await GraphQLPublic(
      publicationLegacyMetaQuery,
      {},
      { publicationId: publicationSlug }
    ).catch(nullIfMissing);
    const urlSlug = legacy?.getPublication?.urlSlug;
    if (!urlSlug) notFound();
    permanentRedirect(publicHref('publications', urlSlug, urlSlug));
  }

  const result = await GraphQLPublic(
    publicationDetailsQuery,
    {},
    { publicId: publicationSlug }
  ).catch(nullIfMissing);
  const publication = result?.getPublication;
  if (!publication || publication.status !== PublicationStatus.Published)
    notFound();
  if (publication.urlSlug && publication.urlSlug !== publicationSlug) {
    permanentRedirect(
      publicHref('publications', publication.urlSlug, publication.urlSlug)
    );
  }

  const pageUrl = publicPageUrl(
    'publications',
    publication.urlSlug || publicationSlug
  );
  const title = publication.title.trim() || 'Untitled publication';
  const resourceType = publication.resourceType?.name ?? null;
  const sectors = uniqueNames(publication.sectors.map((sector) => sector.name));
  const geographies = uniqueNames(
    publication.geographies.map((geography) => geography.name)
  );
  const contributorNames = publicationContributorNames(publication);
  const publisher = publicationPublisher(publication);
  const media = publicationMedia(publication);
  const files = media.filter(
    (item): item is Extract<PublicationMediaItem, { kind: 'file' }> =>
      item.kind === 'file'
  );
  const license = datasetLicenseLabel(publication.license) || null;
  const published = publishedOn(publication);
  const sourceHref = publication.externalSourceLink?.trim() || null;

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    url: pageUrl,
    description: publication.description ?? undefined,
    genre: resourceType ?? undefined,
    author: contributorNames.map((name) => ({ '@type': 'Person', name })),
    datePublished: publication.publicationDate ?? undefined,
    license: datasetLicenseTermsUrl(publication.license) ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: publisher?.name ?? 'CivicDataSpace',
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <JsonLd json={jsonLd} />
      <main className="bg-surfaceDefault">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: BACK_HREF, label: 'Publications' },
            { href: '#', label: title },
          ]}
        />
        <PublicationCover
          backHref={BACK_HREF}
          pageUrl={pageUrl}
          title={title}
          description={publication.description?.trim() || null}
          resourceType={resourceType}
          sectors={sectors}
          geographies={geographies}
          contributorNames={contributorNames}
          publisherName={publisher?.name ?? null}
          illustration={publicationIllustration(publication.resourceType)}
          license={license}
          publishedOn={published}
          sourceHref={sourceHref}
          files={files}
        />
        <div className="mx-auto box-border flex min-w-0 max-w-[1480px] flex-col gap-12 px-4 pb-12 pt-12 md:px-6 lg:px-8 xl:px-10">
          <PublicationFiles items={media} />
          <PublicationInformation
            resourceType={resourceType}
            sectors={sectors}
            geographies={geographies}
            publishedOn={published}
            license={license}
            licenseTermsHref={datasetLicenseTermsUrl(publication.license)}
            publisher={publisher}
            contributorNames={contributorNames}
            sourceHref={sourceHref}
            citation={publicationCitation(publication, publisher?.name ?? null)}
          />
        </div>
      </main>
    </>
  );
}
