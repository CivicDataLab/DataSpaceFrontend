'use client';

import React from 'react';
import { Button, DropZone, Icon, Text } from 'opub-ui';

import { bytesToSize } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from '../dataset.module.scss';

export function UploadResource() {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT'];

  const [fileSelected, setFileSelected] = React.useState(false);

  const [file, setFile] = React.useState<File>();

  const handleDropZoneDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
      setFileSelected(true);
    },
    [setFileSelected]
  );

  function handleFileDelete(props: React.MouseEvent<HTMLButtonElement>) {
    props.stopPropagation();
    setFileSelected(false);
    setFile(undefined);
  }

  const hint = (
    <>
      <button> Click here to add files</button>
      <Text>Maximum File Size Limit : 5 MB</Text>
      <Text className="flex items-center gap-1">
        Supported File Types :{' '}
        {fileTypes.map((type, index) => {
          return (
            <div className="rounded-1 bg-basePureWhite px-2 " key={index}>
              {type}
            </div>
          );
        })}
      </Text>
    </>
  );

  const fileUpload = !file && <DropZone.FileUpload actionHint={hint} />;
  const uploadedFile = file && (
    <div className="flex h-full items-center justify-center py-16">
      <div className="surfaceDefault flex items-center gap-3 rounded-05 px-3 py-2">
        <Icon source={Icons.check} size={24} color="success" />

        <div className="flex flex-col">
          <div className="max-w-[180px]">
            <Text variant="headingMd" truncate>
              {file.name}
            </Text>
          </div>
          <Text variant="bodyMd" color="subdued">
            {bytesToSize(file.size)}
          </Text>
        </div>
        <Button
          size="slim"
          icon={<Icon source={Icons.delete} size={24} />}
          kind="tertiary"
          accessibilityLabel="delete resource"
          onClick={handleFileDelete}
        />
      </div>
    </div>
  );

  return (
      <DropZone
        name="file_details"
        allowMultiple={false}
        label="Upload"
        onChange={handleDropZoneDrop}
        labelHidden
      >
        {uploadedFile}
        {fileUpload}
      </DropZone>
  );
}
