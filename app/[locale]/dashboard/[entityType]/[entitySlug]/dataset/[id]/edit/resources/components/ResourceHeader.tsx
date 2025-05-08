import React from 'react';
import { Button, Dialog, DropZone, Icon, Sheet, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface ResourceHeaderProps {
  listViewFunction: () => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  dropZone:any;
  uploadedFile: React.ReactNode;
  file: File[];
  list: { value: string; label: string }[];
  resourceId: string;
  handleResourceChange: (resourceId: string) => void;
}

const ResourceHeader = ({
  listViewFunction,
  isSheetOpen,
  setIsSheetOpen,
  dropZone,
  uploadedFile,
  file,
  list,
  resourceId,
  handleResourceChange,
}:ResourceHeaderProps) => {
  return (
    <div>
      <div className="flex  justify-between gap-6">
        <Button
          className=" h-fit w-fit justify-end"
          size="slim"
          kind="tertiary"
          variant="interactive"
          onClick={listViewFunction}
        >
          <span className="flex items-center gap-2">
            <Icon source={Icons.back} color="warning" size={24} />
          </span>
        </Button>

        <Sheet open={isSheetOpen}>
          <Sheet.Trigger>
            <Button onClick={() => setIsSheetOpen(true)}>
              Select Data File
            </Button>
          </Sheet.Trigger>
          <Sheet.Content side="bottom">
            <div className="flex flex-col gap-6 p-10">
              <div className="flex items-center justify-between">
                <Text variant="bodyLg">Select Charts</Text>
                <div className="flex items-center gap-3">
                  <Dialog>
                    <Dialog.Trigger>
                      <Button className=" mx-5">ADD NEW DATA FILE</Button>
                    </Dialog.Trigger>
                    <Dialog.Content title={'Add New Resource'}>
                      <DropZone
                        name="file_upload"
                        allowMultiple={true}
                        onDrop={dropZone}
                      >
                        {uploadedFile}
                        {file.length === 0 && <DropZone.FileUpload />}
                      </DropZone>
                    </Dialog.Content>
                  </Dialog>
                  <Button kind="tertiary" onClick={() => setIsSheetOpen(false)}>
                    <Icon source={Icons.cross} size={24} />
                  </Button>
                </div>
              </div>
              {list.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-1 border-1 border-solid border-baseGraySlateSolid6 px-6 py-3 ${resourceId === item.value ? ' bg-baseGraySlateSolid5' : ''}`}
                >
                  <Button
                    kind={'tertiary'}
                    className="flex w-full justify-start"
                    disabled={resourceId === item.value}
                    onClick={(e) => {
                      handleResourceChange(item.value);
                      setIsSheetOpen(false);
                    }}
                  >
                    {item.label}
                  </Button>
                </div>
              ))}
            </div>
          </Sheet.Content>
        </Sheet>
      </div>
    </div>
  );
};

export default ResourceHeader;
