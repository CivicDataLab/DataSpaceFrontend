'use client';

import Link from 'next/link';
import { IconBrandTabler, IconShare3 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Button, Icon, Text, TextField } from 'opub-ui';

import { Icons } from '@/components/icons';
import styles from '../page.module.scss';

export function Content() {
  const t = useTranslations('home');

  return (
    <>
      <IconBrandTabler size={200} color="var(--icon)" />
      <Text variant="heading4xl" as="h1" alignment="center">
        {t('title')}
      </Text>
      <Text color="subdued" variant="bodyLg" as="p" alignment="center">
        {t('subtitle')}
      </Text>

      <div className="hidden w-full max-w-[600px] md:block">
        <TextField
          prefix={<Icon source={Icons.search} />}
          placeholder="Search"
          name="Search"
          label="Search"
          labelHidden
          // ref={}
        />
      </div>

      {/* <Button
        variant="interactive"
        kind="secondary"
        url="/dashboard/dataset"
        icon={<Icon source={IconShare3} />}
        className="mt-4"
      >
        <Text variant="headingMd">{t('cta')}</Text>
      </Button> */}
    </>
  );
}
