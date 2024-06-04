import React from 'react';
import { Icon, Text } from 'opub-ui';

import { Icons } from './icons';

interface TagProps {
  type: 'public' | 'protected' | 'private' | string;
  iconOnly?: boolean;
  size?: 20 | 32;
  background?: boolean;
  helpText?: boolean;
}

const CustomTags: React.FC<TagProps> = ({
  type,
  iconOnly,
  size = 32,
  background = true,
  helpText = true,
}) => {
  let bgColor;
  let label;
  let iconName;
  let text;

  switch (type.toLowerCase()) {
    case 'public':
      bgColor = 'var(--base-green-solid-7)';
      label = 'PUBLIC ACCESS';
      text = 'Can be downloaded directly';
      iconName = Icons.openAccess;
      break;
    case 'protected':
      bgColor = 'var(--base-amber-solid-6)';
      label = 'PROTECTED ACCESS';
      text = 'Register/ Login to download';
      iconName = Icons.registeredAccess;
      break;
    case 'private':
      bgColor = 'var(--base-red-solid-7)';
      label = 'PRIVATE ACCESS';
      text = 'Request access for download';
      iconName = Icons.restrictedAccess;
      break;
    default:
      bgColor = 'white';
      label = type;
      break;
  }

  return (
    <div className="flex gap-2">
      <div
        className="h-fit w-fit p-1"
        style={{
          background: background ? bgColor : 'white',
          borderRadius: '4px',
        }}
      >
        <div className="flex w-full gap-2 ">
          {iconName && (
            <Icon
              source={iconName}
              color={background ? 'onBgDefault' : 'highlight'}
              size={size}
            />
          )}
        </div>
      </div>
      {!iconOnly && (
        <div className="flex flex-col justify-center gap-1">
          <Text variant="bodyMd">{label}</Text>
          {helpText && <Text>{text}</Text>}
        </div>
      )}
    </div>
  );
};

export default CustomTags;
