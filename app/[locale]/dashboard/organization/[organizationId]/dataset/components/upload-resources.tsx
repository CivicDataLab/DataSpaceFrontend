'use client';

import { Button, Icon, Text } from 'opub-ui';
import { Icons } from '@/components/icons';

export function UploadResource() {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT'];

  return (
    <div className="mt-6 flex min-h-[70vh] items-center justify-center rounded-2 bg-baseGraySlateSolid4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Icon source={Icons.fileUpload} size={60} />
        <Text>Drag and drop multiple files here, OR</Text>
        <Button kind="secondary" variant="interactive">
          Choose files to Upload
        </Button>
        <Text>Maximum File Size Limit : 5 MB</Text>
        <Text className="flex items-center gap-1">
          Supported File Types :{' '}
          {fileTypes.map((type, index) => {
            return (
              <div className="rounded-1 bg-basePureWhite px-2 py-1" key={index}>
                {type}
              </div>
            );
          })}
        </Text>
      </div>
    </div>
  );
}
