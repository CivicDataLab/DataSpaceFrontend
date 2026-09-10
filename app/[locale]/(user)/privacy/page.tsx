import Link from 'next/link';
import { Text } from 'opub-ui';

import { generatePageMetadata } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';

const GOOGLE_PRIVACY_TERMS_URL = 'https://policies.google.com/privacy';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Privacy Policy | CivicDataSpace',
    description:
      'How CivicDataLab collects, uses, and protects personal information on CivicDataSpace, and your rights under India’s Digital Personal Data Protection Act, 2023.',
    keywords: [
      'CivicDataSpace',
      'Privacy Policy',
      'Data Protection',
      'Personal Data',
      'CivicDataLab',
      'DPDP Act',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/privacy`,
      title: 'Privacy Policy | CivicDataSpace',
      description:
        'How CivicDataLab collects, uses, and protects personal information on CivicDataSpace, and your rights under India’s Digital Personal Data Protection Act, 2023.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

const Privacy = () => {
  return (
    <main>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Privacy' },
        ]}
      />
      <div className="container mb-5 py-5 lg:py-10">
        <div className="flex flex-col gap-2">
          <Text variant="heading2xl">Privacy Policy</Text>
          <Text variant="bodyMd" color="subdued">
            Last updated: Aug 11, 2026
          </Text>
        </div>
        <div className="flex flex-col gap-4 pt-4 lg:gap-6 lg:pt-6">
          <Text variant="headingLg" fontWeight="regular" className="leading-5">
            CivicDataLab (“we”, “us”) operates{' '}
            <Link className="underline" href="/">
              CivicDataSpace
            </Link>{' '}
            (the “Platform”) -
            an open, collaborative platform for data changemakers, where
            governments, researchers, technologists, and civil society come
            together to share datasets, knowledge resources, and AI use-cases
            for the public good.
          </Text>
          <Text variant="headingLg" fontWeight="regular" className="leading-5">
            This Policy explains what personal information we collect, why we
            collect it, how we protect it, and your rights under India’s Digital
            Personal Data Protection Act, 2023.
          </Text>

          <div className="flex flex-col gap-3">
            <Text variant="headingLg">What we collect</Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              We collect the following personal information relating to
              registered users:
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              If you register: name, email, organisation, designation. Location
              is collected only if you choose to provide it.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Automatically: IP address, timestamp, and pages requested, logged
              for security and platform stability only.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Cookies: session cookies for login; Google Analytics to understand
              Platform usage (see{' '}
              <a
                className="underline"
                href={GOOGLE_PRIVACY_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google’s Privacy &amp; Terms
              </a>
              ). No advertising trackers are used.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Published datasets: drawn from public/government sources and
              describe places and systems, not individual people. Certain public
              sources name identifiable individuals (e.g. a contractor in a
              tender) - we do not use it to profile or draw inferences about
              that person.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <Text variant="headingLg">How we use the data</Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              We use your information only to run your account, enable
              contributions, communicate with you, secure the Platform, and
              comply with the law.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              We do not use advertising trackers, we do not sell your personal
              information or your Platform activity data to anyone, for any
              purpose, and we do not share it for third-party marketing. We may
              share it with our own team or vetted service providers (under
              confidentiality obligations), with law enforcement/courts where
              legally required (with prior notice where permitted), and with the
              Data Protection Board of India where required, e.g. for breach
              reporting.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              A small amount of technical information is processed automatically
              to keep the Platform running. Our servers also keep standard
              access logs, ie the IP address, time, and page requested, for
              security purposes. These are retained for one year, as required by
              the security provisions of the Digital Personal Data Protection
              Rules, 2025, and are used only to detect and investigate security
              incidents, never to identify or profile visitors. This data exists
              to keep the Platform secure and working, and for nothing else.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              We also use Google analytics to collect data on how our users are
              using CivicDataSpace so that we can improve its functionality.
              Please see the{' '}
              <a
                className="underline"
                href={GOOGLE_PRIVACY_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy &amp; Terms
              </a>{' '}
              for information on how Google handles these data.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <Text variant="headingLg">
              Data storage, security and retention
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Data is stored on servers in India. Access to personal information
              is restricted to authorised CivicDataLab staff, who undergo
              regular data security training, and service providers on a
              role-based, need-to-know basis; access to raw data and backend
              systems is limited to designated administrators. We encrypt data
              in transit and store passwords in hashed form. In case of any
              breach, we will notify you and the Data Protection Board as
              required by law.
            </Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Account information is kept while your account is active or until
              you withdraw consent/request deletion. Technical logs
              are retained for a minimum of one year under Rule 8 of the DPDP
              Rules, 2025, made under the DPDP Act, 2023, then erased unless
              other laws require longer retention.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <Text variant="headingLg">Your rights</Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              Under the DPDP Act, you can ask us what personal data we hold
              about you, and ask us to correct or delete it. You can also raise
              a complaint about how data is handled. For any of these, write to
              us at{' '}
              <a className="underline" href="mailto:legal@civicdatalab.in">
                legal@civicdatalab.in
              </a>
              . We will acknowledge your request and resolve it within 90 days,
              as required under the Digital Personal Data Protection Rules,
              2025.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <Text variant="headingLg">Contact</Text>
            <Text variant="headingLg" fontWeight="regular" className="leading-5">
              <a className="underline" href="mailto:legal@civicdatalab.in">
                legal@civicdatalab.in
              </a>
            </Text>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
