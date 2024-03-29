import React from 'react';
import { Icon, Text } from 'opub-ui';

import { Icons } from './icons';

interface TagProps {
  type: 'open' | 'registered' | 'restricted';
  icon: true | false;
}

const CustomTags: React.FC<TagProps> = ({ type, icon = false }) => {
  let bgColor;
  let label;
  switch (type.toLowerCase()) {
    case 'open':
      bgColor = 'var(--base-green-solid-7)';
      label = 'Open Access';
      break;
    case 'registered':
      bgColor = 'var(--base-amber-solid-6)';
      label = 'Registered Access';
      break;
    case 'restricted':
      bgColor = 'var(--base-red-solid-7)';
      label = 'Restricted Access';
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
        backgroundColor: bgColor,
        borderRadius: '4px',
      }}
    >
      <div className="flex w-full gap-2 ">
        {icon && <Icon source={Icons.access} />}
        <Text className="" variant="bodyMd">
          {label}
        </Text>
      </div>
    </div>
  );
};

export default CustomTags;
// 12px padding 8x 2 y

// 14px p 4

// size icon
