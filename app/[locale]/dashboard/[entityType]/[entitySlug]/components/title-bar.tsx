import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Spinner, Text, TextField } from 'opub-ui';

import { Icons } from '@/components/icons';
import { useDatasetEditStatus } from '../dataset/[id]/edit/context';
import { useEditStatus } from '../usecases/edit/context';

interface TitleBarProps {
  label: string;
  title: string;
  goBackURL: string;
  onSave: (data: any) => void;
  loading: boolean;
  status: 'loading' | 'success';
  setStatus: (s: 'loading' | 'success') => void;}

const TitleBar = ({
  label,
  title,
  goBackURL,
  onSave,
  loading,
  status,
  setStatus,
}: TitleBarProps) => {
  const [edit, setEdit] = useState(false);
  const [titleData, setTitleData] = useState(title);

  useEffect(() => {
    setStatus(loading ? 'loading' : 'success');
  }, [loading]);

  return (
    <div className="flex flex-wrap justify-between gap-4 lg:flex-nowrap">
      <div className="flex flex-wrap items-center gap-2 lg:h-10 lg:flex-nowrap">
        <Text>{label}:</Text>
        {edit ? (
          <TextField
            label={''}
            name="title"
            defaultValue={title}
            onChange={(e) => {
              setTitleData(e);
            }}
          />
        ) : (
          <Text fontWeight="bold">{title}</Text>
        )}
        <div className=" pl-2">
          {edit && (
            <Button
              kind="tertiary"
              onClick={() => {
                onSave(titleData);
                setEdit(!edit);
              }}
              disabled={title === titleData}
            >
              Save
            </Button>
          )}

          {!edit && (
            <Button
              kind="tertiary"
              onClick={() => {
                setEdit(!edit);
              }}
            >
              <Icon source={Icons.pencil} size={16} color="warning" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 lg:flex-nowrap">
        <div className="flex flex-wrap items-center gap-2">
          {' '}
          <Text>
            {status === 'loading' ? 'Saving...' : 'All Changes Saved'}
          </Text>
          {status === 'loading' ? (
            <Spinner size={20} />
          ) : (
            <Icon source={Icons.checkUnfilled} size={20} color="success" />
          )}
        </div>
        <Link href={goBackURL}>
          {' '}
          <span className="flex flex-wrap items-center gap-2 text-secondaryOrange lg:flex-nowrap">
            Close Editor <Icon source={Icons.cross} size={16} color="warning" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default TitleBar;
