'use client';

import { IconBrandTabler } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Button, ButtonGroup, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

export function Content() {
  const t = useTranslations('home');

  return (
    <>
      <IconBrandTabler size={64} color="black" />
      <Text variant="heading4xl" as="h1" alignment="center">
        {t('title')}
      </Text>
      <Text
        color="subdued"
        variant="bodyLg"
        as="p"
        alignment="center"
        className="mb-4"
      >
        {t('subtitle')}
      </Text>
      <ButtonGroup>
        <Button variant="interactive" kind="secondary" url="/chart">
          <Text variant="headingMd">Go to Charts</Text>
        </Button>
        <Button
          variant="interactive"
          kind="primary"
          url="/dashboard"
          icon={<Icon source={Icons.share} color="onBgDefault" />}
        >
          <Text color="onBgDefault" variant="headingMd">
            {t('cta')}
          </Text>
        </Button>
      </ButtonGroup>
    </>
  );
}
