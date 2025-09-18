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
      <div className="flex items-center justify-between p-4 lg:px-20 lg:py-6">
        <div className="flex gap-6 uppercase">
          <Link href={'/about-us'}>
            <Text color="onBgDefault">About Us</Text>
          </Link>
          <Link href={'mailto:info@civicdatalab.in'}>
            <Text color="onBgDefault">Contact Us</Text>
          </Link>
        </div>
        <div className="flex gap-3 absolute left-1/2 transform -translate-x-1/2">
          {socialMedia.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              target="_blank"
              className="h-10 w-10 rounded-5 bg-tertiaryAccent p-2"
            >
              <Icon
                className={cn(styles.FooterIcons)}
                source={item.icon}
                size={24}
              />
            </Link>
          ))}
        </div>
        <div className="flex items-center text-white">
          <Text color="onBgDefault">Made in India. A DataSpace product by</Text>
          <Link
            href={'https://www.civicdatalab.in'}
            target="_blank"
            className="flex items-center gap-2 ml-1"
          >
             <Text color="onBgDefault">CivicDataLab</Text>
            <Image src={'/cdl.svg'} width={40} height={40} alt="CDL logo" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainFooter;
