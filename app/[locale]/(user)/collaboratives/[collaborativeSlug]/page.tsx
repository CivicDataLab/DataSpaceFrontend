import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ClientError } from 'graphql-request';

import locales from '@/config/locales';
import { GraphQLPublic } from '@/lib/api';
import { isCollaborativeSubdomainHost } from '@/lib/collaborativesRouting';
import {
  backendFileUrl,
  formatShortDate,
  joinNames,
  uniqueNames,
} from '@/lib/public-entity';
import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import {
  collaborativeExploreData,
  collaborativeSdgs,
  collaborativeSummaryText,
} from './collaborative-detail';
import { CollaborativeAbout } from './components/CollaborativeAbout';
import { CollaborativeExplore } from './components/CollaborativeExplore';
import { CollaborativeHero } from './components/CollaborativeHero';
import { CollaborativeViewTracker } from './components/CollaborativeViewTracker';
import { collaborativeDetailsQuery, collaborativeMetaQuery } from './queries';

type PageProps = {
  params: Promise<{ locale: string; collaborativeSlug: string }>;
};

/**
 * Listing and subdomain links use the slug; newer links use the public id.
 * Null means no such collaborative. If the API is down, this throws, so the
 * visitor sees an error page instead of a "not found" page.
 */
async function findCollaborative<TResult>(
  segment: string,
  load: (lookup: { slug?: string; publicId?: string }) => Promise<TResult>,
  pick: (result: TResult) => unknown
): Promise<TResult | null> {
  const bySlug = await load({ slug: segment }).catch(nullIfMissing);
  if (bySlug && pick(bySlug)) return bySlug;
  return load({ publicId: segment }).catch(nullIfMissing);
}

/**
 * The API answers an unknown collaborative with a GraphQL error
 * ("Collaborative … does not exist.") on a normal 200 response. Any other
 * failure — network, timeout, server error — is passed on.
 */
function nullIfMissing(error: unknown): null {
  if (
    error instanceof ClientError &&
    error.response.status === 200 &&
    error.response.errors?.length
  ) {
    return null;
  }
  throw error;
}

function pageUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? '').replace(/\/$/, '');
  return `${base}/collaboratives/${slug}`;
}

// On `<slug>.<platform domain>` every path is rewritten into this
// collaborative (proxy.ts), so links to other pages must point at the main
// platform. English URLs carry no locale prefix.
function platformLinkBase(locale: string): string {
  const base = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? '').replace(/\/$/, '');
  if (!base) return '';
  return locale === locales.default ? base : `${base}/${locale}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { collaborativeSlug } = await params;
  // Metadata falls back to generic text on any failure; the page decides
  // between "not found" and an error.
  const result = await findCollaborative(
    collaborativeSlug,
    (lookup) => GraphQLPublic(collaborativeMetaQuery, {}, lookup),
    (data) => data.collaborativeBySlug
  ).catch(() => null);
  const collaborative = result?.collaborativeBySlug;
  const title = collaborative?.title?.trim() || 'Collaborative Details';
  const url = pageUrl(collaborative?.slug || collaborativeSlug);
  const description =
    collaborativeSummaryText(collaborative?.summary) ||
    `Explore open data and curated datasets in the ${title} collaborative.`;

  return {
    ...generatePageMetadata({
      title: `${title} | Collaborative Data | CivicDataSpace`,
      description,
      keywords: collaborative?.tags?.map((tag) => tag.value) || [
        'collaborative',
        'data',
        'civic',
        'open data',
      ],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url,
        title: `${title} | Collaborative Data | CivicDataSpace`,
        description,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    }),
    alternates: { canonical: url },
  };
}

export default async function CollaborativeDetailPage({ params }: PageProps) {
  const { locale, collaborativeSlug } = await params;
  const result = await findCollaborative(
    collaborativeSlug,
    (lookup) => GraphQLPublic(collaborativeDetailsQuery, {}, lookup),
    (data) => data.collaborativeBySlug
  );
  const collaborative = result?.collaborativeBySlug;
  if (!collaborative) notFound();

  // On `<slug>.<platform domain>` the collaborative is the whole site, so
  // there is no list to go back to.
  const host = (await headers()).get('host')?.split(':')[0] ?? '';
  const onSubdomain = isCollaborativeSubdomainHost(host);
  const linkBase = onSubdomain ? platformLinkBase(locale) : '';

  const title = collaborative.title?.trim() || 'Untitled collaborative';
  const url = pageUrl(collaborative.slug || collaborativeSlug);
  const explore = collaborativeExploreData(collaborative, linkBase);
  const sdgs = collaborativeSdgs(collaborative);
  const platformUrl = collaborative.platformUrl?.trim() || null;
  const contactEmail = collaborative.contactEmail?.trim() || null;
  const summaryText = collaborativeSummaryText(collaborative.summary);

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url,
    description: summaryText || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: process.env.NEXT_PUBLIC_PLATFORM_URL,
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <JsonLd json={jsonLd} />
      <CollaborativeViewTracker id={collaborative.id} title={title} />
      <main className="bg-white">
        {onSubdomain ? null : (
          <BreadCrumbs
            data={[
              { href: '/', label: 'Home' },
              { href: '/collaboratives', label: 'Collaboratives' },
              { href: '#', label: title },
            ]}
          />
        )}
        <CollaborativeHero
          backHref={onSubdomain ? null : '/collaboratives'}
          linkBase={linkBase}
          pageUrl={url}
          title={title}
          tags={uniqueNames(collaborative.tags?.map((tag) => tag.value))}
          sdgs={sdgs}
          imageSrc={
            backendFileUrl(collaborative.coverImage?.url) ??
            backendFileUrl(collaborative.logo?.url)
          }
          collaborateHref={
            platformUrl ?? (contactEmail ? `mailto:${contactEmail}` : null)
          }
          counts={{
            peopleAndOrganisations:
              explore.people.length + explore.organisations.length,
            datasetsAndUseCases:
              explore.datasets.length + explore.useCases.length,
            publications: explore.publications.length,
          }}
        />
        <div className="mx-auto box-border min-w-0 max-w-[1400px] px-5 sm:px-6 lg:px-8 xl:px-0">
          <CollaborativeAbout
            title={title}
            summaryHtml={summaryText ? (collaborative.summary ?? null) : null}
            website={platformUrl}
            geography={joinNames(
              collaborative.geographies?.map((geography) => geography.name)
            )}
            updatedOn={formatShortDate(collaborative.modified)}
            pageUrl={url}
            counts={{
              useCases: explore.useCases.length,
              publications: explore.publications.length,
              datasets: explore.datasets.length,
              people: explore.people.length,
              organisations: explore.organisations.length,
              sdgs: sdgs.length,
            }}
          />
          <CollaborativeExplore data={explore} />
        </div>
      </main>
    </>
  );
}
