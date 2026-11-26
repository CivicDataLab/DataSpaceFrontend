import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PublicationStatus } from '@/gql/generated/graphql';

import { GraphQLPublic } from '@/lib/api';
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
  publicationAuthorNames,
  publicationCitation,
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

  // The API returns null for a publication that doesn't exist, so a thrown
  // error here is a real failure (API down) and shows the error page, not 404.

  // Old links used the record's UUID; send them to the readable address.
  if (isUuid(publicationSlug)) {
    const legacy = await GraphQLPublic(
      publicationLegacyMetaQuery,
      {},
      { publicationId: publicationSlug }
    );
    const urlSlug = legacy?.getPublication?.urlSlug;
    if (!urlSlug) notFound();
    permanentRedirect(publicHref('publications', urlSlug, urlSlug));
  }

  const result = await GraphQLPublic(
    publicationDetailsQuery,
    {},
    { publicId: publicationSlug }
  );
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
  const authors = publicationAuthorNames(publication);
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
    author: authors.map((name) => ({ '@type': 'Person', name })),
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
          authors={authors}
          publisherName={publisher?.name ?? null}
          illustration={publicationIllustration(publication.resourceType)}
          license={license}
          publishedOn={published}
          sourceHref={sourceHref}
          files={files}
        />
        <div className="mx-auto box-border flex min-w-0 max-w-[1152px] flex-col gap-12 px-5 pb-12 pt-12 sm:px-6 lg:px-8 xl:px-0">
          <PublicationFiles items={media} />
          <PublicationInformation
            resourceType={resourceType}
            sectors={sectors}
            geographies={geographies}
            publishedOn={published}
            license={license}
            licenseTermsHref={datasetLicenseTermsUrl(publication.license)}
            publisher={publisher}
            authors={authors}
            sourceHref={sourceHref}
            citation={publicationCitation(publication, publisher?.name ?? null)}
          />
        </div>
      </main>
    </>
  );
}
