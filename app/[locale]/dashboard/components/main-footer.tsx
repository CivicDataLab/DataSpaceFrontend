import Image from 'next/image';
import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from './styles.module.scss';

const MainFooter = () => {
  const socialMedia = [
    {
      icon: Icons.github,
      link: 'https://github.com/civicdatalab',
    },
    {
      icon: Icons.linkedin,
      link: 'https://www.linkedin.com/company/civicdatalab',
    },
    {
      icon: Icons.twitter,
      link: 'https://twitter.com/civicdatalab',
    },
    {
      icon: Icons.facebook,
      link: 'https://facebook.com/civicdatalab',
    },
  ];
  return (
    <div className="bg-primaryBlue">
      <div className="flex items-center justify-between p-4 lg:px-20 lg:py-6 relative lg:flex-row flex-wrap gap-2">
        <div className="flex gap-3 lg:gap-6 uppercase text-sm lg:text-base order-1 lg:order-none">
          <Link href={'/about-us'}>
            <Text color="onBgDefault">About Us</Text>
          </Link>
          <Link href={'mailto:info@civicdatalab.in'}>
            <Text color="onBgDefault">Contact Us</Text>
          </Link>
        </div>
        <div className="flex lg:hidden gap-2 order-2">
          {socialMedia.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              target="_blank"
              className="h-8 w-8 rounded-5 bg-tertiaryAccent p-1.5"
            >
              <Icon
                className={cn(styles.FooterIcons)}
                source={item.icon}
                size={16}
              />
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex gap-3 absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
          {socialMedia.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              target="_blank"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-5 bg-tertiaryAccent p-1.5 lg:p-2"
            >
              <Icon
                className={cn(styles.FooterIcons)}
                source={item.icon}
                size={20}
              />
            </Link>
          ))}
        </div>
        <div className="text-white text-xs lg:text-base order-3 lg:order-none">
          <Text color="onBgDefault">Made in India. A DataSpace product by </Text>
          <Link
            href={'https://www.civicdatalab.in'}
            target="_blank"
            className="inline-flex items-center gap-1"
          >
             <Text color="onBgDefault">CivicDataLab</Text>
            <Image src={'/cdl.svg'} width={32} height={32} className="lg:w-10 lg:h-10" alt="CDL logo" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainFooter;