import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { siteConfig } from '@/config/site';
import Provider from '@/components/provider';
import locales from '../../config/locales';

const fontSans = FontSans({ subsets: ['latin'], display: 'swap' });

export function generateStaticParams() {
  return locales.all.map((locale) => ({ locale }));
}

// export async function generateMetadata() {
//   return {
//     metadataBase: new URL(siteConfig.url),
//     title: {
//       default: siteConfig.name,
//       template: `%s | ${siteConfig.name}`,
//     },
//     description: siteConfig.description,
//     keywords: [
//       'Next.js',
//       'React',
//       'Server Components',
//       'Radix UI',
//       'OPub',
//       'Open Publishing',
//     ],
//     authors: [
//       {
//         name: 'CivicDataLab',
//         url: 'https://civicdatalab.in/',
//       },
//     ],
//     creator: 'CivicDataLab',
//     openGraph: {
//       type: 'website',
//       locale: 'en_US',
//       url: siteConfig.url,
//       title: siteConfig.name,
//       description: siteConfig.description,
//       siteName: siteConfig.name,
//       images: [`${siteConfig.url}/og.png`],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: siteConfig.name,
//       description: siteConfig.description,
//       images: [`${siteConfig.url}/og.png`],
//       creator: 'CivicDataLab',
//     },
//     icons: {
//       icon: '/favicon.ico',
//       shortcut: '/favicon-16x16.png',
//       apple: `${siteConfig.url}/apple-touch-icon.png`,
//     },
//     manifest: `${siteConfig.url}/site.webmanifest`,
//   };
// }

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  let messages;
  try {
    messages = (await import(`../../locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={fontSans.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Provider>{children}</Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
