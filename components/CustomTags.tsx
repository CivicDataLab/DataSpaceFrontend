import React from 'react';
import { Icon, Text } from 'opub-ui';

import { Icons } from './icons';

interface TagProps {
  type: 'open' | 'registered' | 'restricted';
  icon?: boolean;
}

const CustomTags: React.FC<TagProps> = ({ type, icon = false }) => {
  let bgColor;
  let label;
  let iconName;
  switch (type.toLowerCase()) {
    case 'open':
      bgColor = 'var(--base-green-solid-7)';
      label = 'Open Access';
      iconName = Icons.openAccess;
      break;
    case 'registered':
      bgColor = 'var(--base-amber-solid-6)';
      label = 'Registered Access';
      iconName = Icons.registeredAccess;

      break;
    case 'restricted':
      bgColor = 'var(--base-red-solid-7)';
      label = 'Restricted Access';
      iconName = Icons.restrictedAccess;
      break;
    default:
      bgColor = 'white';
      label = type;
      break;
  }

  return (
    <div
      className="h-fit w-fit p-1"
      style={{
        border: ` 2px solid  ${bgColor}`,
        borderRadius: '4px',
      }}
    >
      <div className="flex w-full gap-2 ">
        {icon && iconName && <Icon source={iconName} />}
        <Text variant="bodyMd">{label}</Text>
      </div>
    </div>
  );
};

export default CustomTags;
