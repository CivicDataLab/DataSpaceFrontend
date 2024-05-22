'use client';

import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from 'next-usequerystate';

import AccessModelForm from '../components/AccessModelForm';
import AccessModelList from '../components/AccessModelList';

const Access = () => {
  const [list, setList] = useQueryState(
    'list',
    parseAsBoolean.withDefault(true) // Default value set to true boolean
  );

  const [accessModelId, setAccessModelId] = useQueryState('id', parseAsString);

  return (
    <div>
      {list ? (
        <AccessModelList
          setList={setList}
          list={list}
          setAccessModelId={setAccessModelId}
        />
      ) : (
        <AccessModelForm
          setList={setList}
          setAccessModelId={setAccessModelId}
          accessModelId={accessModelId}
        />
      )}
    </div>
  );
};

export default Access;
