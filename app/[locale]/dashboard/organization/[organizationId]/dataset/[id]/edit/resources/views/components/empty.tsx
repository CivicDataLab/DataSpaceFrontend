import { IconBrackets } from '@tabler/icons-react';
import { Icon, Text } from 'opub-ui';

export const EmptyState = () => {
  return (
    <section className="flex flex-col items-center">
      <Icon source={IconBrackets} size={48} color="default" />
      <Text as="h3" variant="headingXl" className="mt-4">
        No Views Added
      </Text>
      <Text variant="bodyMd" className="mt-2 block">
        Create a new view for the resource
      </Text>
    </section>
  );
};
