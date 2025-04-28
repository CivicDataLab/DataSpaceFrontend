'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Avatar,
  Button,
  Combobox,
  Dialog,
  DropZone,
  Text,
  TextField,
} from 'opub-ui';

import { useEditStatus } from '../../context';

const Details = () => {
  // const params = useParams<{
  //   entityType: string;
  //   entitySlug: string;
  //   id: string;
  // }>();

  // const { setStatus } = useEditStatus();

  //   useEffect(() => {
  //     setStatus(editMutationLoading ? 'loading' : 'success'); // update based on mutation state
  //   }, [editMutationLoading]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  console.log(isModalOpen);

  return (
    <div>
      {' '}
      <div className=" flex flex-col gap-10">
        <div>
          <Text variant="headingMd">CONTRIBUTORS</Text>
          <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
            <div className="flex w-full flex-col gap-5 lg:w-1/4">
              <Combobox
                displaySelected
                name="contributors"
                label="Add Contributors"
                creatable
                list={[]}
                onChange={(value) => {
                  console.log(value);
                }}
              />
              <Text>
                (Some Contributors have been preselected from added Datasets)
              </Text>
            </div>
            <div className="grid grid-cols-3 gap-6 md:grid-cols-4  lg:grid-cols-6">
              {[
                'Aarav Patel',
                'Vivaan Shah',
                'Aditya Verma',
                'Ishaan Gupta',
                'Kabir Mehta',
              ].map((name) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center"
                >
                  <Avatar name={name} size="large" />
                  <span className="text-sm mt-2 font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Text variant="headingMd">SUPPORTED BY</Text>
          <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
            <div className="flex w-full flex-col gap-5 lg:w-1/4">
              <Combobox
                displaySelected
                name="supporters"
                label="Add Supporters"
                creatable
                list={[]}
                onChange={(value) => {
                  console.log(value);
                }}
              />

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
              </Dialog>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4  lg:grid-cols-6">
              <></>
            </div>
          </div>
        </div>
        <div>
          <Text variant="headingMd">PARTNERED BY</Text>
          <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
            <div className="flex w-full flex-col gap-5 lg:w-1/4">
              <Combobox
                displaySelected
                name="partners"
                label="Add Partners"
                creatable
                list={[]}
                onChange={(value) => {
                  console.log(value);
                }}
              />

              <Dialog
                open={isPartnerModalOpen}
                onOpenChange={setIsPartnerModalOpen}
              >
                <Dialog.Trigger asChild>
                  <Button kind="tertiary" className="w-fit font-bold underline">
                    Add New Partner
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content title={'Add New Partner'} limitHeight>
                  <div className=" flex flex-col gap-6">
                    <div>
                      <TextField
                        label="Partner Name"
                        name="partner_name"
                        type="url"
                        value={''}
                        onChange={(e) => console.log(e)}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Partner Url"
                        name="partner_url"
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
              </Dialog>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4  lg:grid-cols-6">
              <></>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
