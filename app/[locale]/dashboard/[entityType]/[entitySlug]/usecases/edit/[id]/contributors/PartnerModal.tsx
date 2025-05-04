import React from 'react';
import { Dialog,Button,TextField,DropZone } from 'opub-ui';

type ModalProps = {
   
    setIsModalOpen?: (value: boolean) => void;
    isModalOpen?: false;
  };
  
  
  const PartnerModal: React.FC<ModalProps> = ({isModalOpen,setIsModalOpen}) => {
  return (
    <div>
      {' '}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen?.(open)}>
        <Dialog.Trigger asChild>
          <Button kind="tertiary" className="w-fit font-bold underline">
            Add New Supporter{' '}
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title={'Add New Supporter'} limitHeight>
          <div className=" flex flex-col gap-6">
            <div>
              <TextField
                label="Organization Name"
                name="org_name"
                type="url"
                value={''}
                onChange={(e) => console.log(e)}
              />
            </div>
            <div>
              <TextField
                label="Organization Url"
                name="org_url"
                type="url"
                value={''}
                onChange={(e) => console.log(e)}
              />
            </div>
            <div>
              <DropZone
                label={'Upload Logo'}
                onDrop={(e) => console.log(e)}
                name={'Logo'}
              >
                <DropZone.FileUpload actionTitle={''} />
              </DropZone>
            </div>
            <Button>Save</Button>
          </div>
        </Dialog.Content>
      </Dialog>{' '}
    </div>
  );
};

export default PartnerModal;
