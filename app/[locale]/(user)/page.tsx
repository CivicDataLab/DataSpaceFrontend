import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';
import { Content } from './components/Content';
import Datasets from './components/Datasets';
import Sectors from './components/Sectors';
import UseCases from './components/UseCases';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'CivicDataSpace – Empowering Public Good with Open Data',
    description:
      'CivicDataSpace is an open-source platform enabling inclusive and AI-ready data collaborative. Explore datasets, use cases, and insights for public good.',
    keywords: [
      'CivicDataSpace',
      'Open Data',
      'Data Collaborative',
      'Public Datasets',
      'AI-ready data',
      'CivicTech',
      'CivicDataLab',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}`,
      title: 'CivicDataSpace – Empowering Public Good with Open Data',
      description:
        'Explore CivicDataSpace, an open-source platform to make data inclusive, interoperable, and impactful for researchers, policymakers, and civic actors.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`, // from /public/og.png
    },
  });

export default async function Home() {
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CivicDataSpace',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}`,
    description:
      'CivicDataSpace is an open-source platform that enables AI-ready data collaboratives and empowers public good through inclusive civic datasets and use cases.',
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataLab',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/about`,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/cdl_logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <div className="bg-surfaceDefault">
        <Content />
        <UseCases />
        <Sectors />
        <Datasets />
      </div>
    </>
  );
}
