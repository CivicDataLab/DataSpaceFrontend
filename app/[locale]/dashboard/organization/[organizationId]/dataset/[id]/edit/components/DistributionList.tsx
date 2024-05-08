import React from 'react';
import Link from 'next/link';
import router from 'next/router';
import {
  Button,
  ButtonGroup,
  Combobox,
  Divider,
  DropZone,
  Icon,
  Text,
} from 'opub-ui';

import { bytesToSize } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { EditDistribution } from './EditDistribution';
import { EditResource } from './EditResource';

export function DistributionList({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
  setEditId: (id: string) => void;
}) {
  return (
    <div>
      {/* <Text variant="headingMd">Add Distribution</Text>
      <div className="pt-4">
        <Divider />
      </div> */}
      <div className="py-4">
        <NoList setPage={setPage} />
      </div>
    </div>
  );
}

const NoList = ({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
}) => {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT'];

  const [fileSelected, setFileSelected] = React.useState(false);
  const [file, setFile] = React.useState<File[]>([]);

  const handleDropZoneDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      setFile((files) => [...files, ...acceptedFiles]);
      setFileSelected(true);
    },
    []
  );

  function handleFileDelete(index: any) {
    const updatedFiles = [...file.slice(0, index), ...file.slice(index + 1)];
    setFile(updatedFiles);
  }

  const hint = (
    <>
      <Button kind="secondary" variant="interactive">
        Choose Files to Upload
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
    </>
  );

  const fileUpload = file.length === 0 && (
    <DropZone.FileUpload actionHint={hint} />
  );
  const uploadedFile = file.length > 0 && (
    <div className="flex h-full items-center justify-center px-2 py-14">
      <div className="flex-col">
        <div>
          <Icon source={Icons.check} size={24} color="success" />
          <div className="flex">{file[0].name.substring(0, 15) + ' ...'} </div>
          <Text variant="bodySm">{file[0].size} bytes</Text>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {fileSelected ? (
        <EditResource
          uploadedFile={uploadedFile}
          handleDropZoneDrop={handleDropZoneDrop}
          file={file}
         />
      ) : (
        <DropZone
          name="file_details"
          label="Upload"
          allowMultiple={true}
          onDrop={handleDropZoneDrop}
          labelHidden
          className="min-h-[70vh] bg-baseGraySlateSolid5"
        >
          {uploadedFile}
          {fileUpload}
        </DropZone>
      )}
    </>
  );
};
