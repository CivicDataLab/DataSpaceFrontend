'use client';

import { parseAsBoolean, useQueryState } from 'next-usequerystate';

import AccessModelForm from '../components/AccessModelForm';
import AccessModelList from '../components/AccessModelList';

const Access = () => {
  const [queryList, setQueryList] = useQueryState(
    'list',
    parseAsBoolean.withDefault(true) // Default value set to true boolean
  );

  return (
    <div>
      {queryList ? (
        <AccessModelList setQueryList={setQueryList} />
      ) : (
        <AccessModelForm setQueryList={setQueryList} />
      )}
    </div>
  );
};

export default Access;
