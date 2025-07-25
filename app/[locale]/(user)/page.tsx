import { generatePageMetadata } from '@/lib/utils';
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
  return (
    <div className="bg-surfaceDefault">
      <Content />
      <UseCases />
      <Sectors />
      <Datasets />
    </div>
  );
}
