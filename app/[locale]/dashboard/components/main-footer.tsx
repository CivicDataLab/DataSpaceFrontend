import Image from 'next/image';
import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

const MainFooter = () => {
  const socialMedia = [
    {
      icon: Icons.twitter,
      link: 'https://twitter.com/civicdatalab',
    },
    {
      icon: Icons.linkedin,
      link: 'https://www.linkedin.com/company/civicdatalab',
    },
    {
      icon: Icons.facebook,
      link: 'https://facebook.com/civicdatalab',
    },
    {
      icon: Icons.github,
      link: 'https://github.com/civicdatalab',
    },
  ];
  return (
    <>
      <div className="bg-primaryBlue">
        <div className="flex flex-col gap-8 p-6 lg:px-28 lg:py-10">
          <div className="flex flex-wrap justify-between gap-8 ">
            {' '}
            <div className="flex items-center gap-2">
              <Image
                src={'/globe_logo.png'}
                width={38}
                height={38}
                alt="logo"
              />
              <Text variant="headingXl" className="text-surfaceDefault" as="h1">
                CivicDataSpace
              </Text>
            </div>
            <div className=" flex flex-col  gap-2 lg:items-end">
              <div>
                {' '}
                <Text
                  color="highlight"
                  className=" font-bold text-borderWarningSubdued"
                >
                  Follow Us
                </Text>
              </div>

              <div className=" flex gap-3">
                {socialMedia.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    target="_blank"
                    className="  h-10  w-10 rounded-5 bg-tertiaryAccent p-2"
                  >
                    <Icon source={item.icon} size={24} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className=" flex flex-wrap justify-between gap-6">
            <div className=" flex  gap-6">
              <Link href={'/about-us'}>
                <Text color="onBgDefault"> About Us</Text>
              </Link>
              {/* <Link href={'#'}>
                <Text color="onBgDefault"> Sitemap</Text>
              </Link>
              <Link href={'#'}>
                <Text color="onBgDefault"> Contact Us</Text>
              </Link> */}
            </div>
            <div className=" flex items-center gap-2">
              <Text color="onBgDefault"> made by</Text>
              <Link href={'https://www.civicdatalab.in'} target="_blank">
                <Image src={'/cdl.svg'} width={38} height={38} alt="logo" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainFooter;
