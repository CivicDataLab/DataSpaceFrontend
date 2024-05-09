import React from 'react';
import Footer from '@/app/[locale]/dashboard/components/GraphqlTable/footer';

import Card from '../Card';

interface DatasetCardsProps {
  data: any;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

const DatasetCards: React.FC<DatasetCardsProps> = ({
  data,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div>
      {data.map((item: any, index: any) => (
        <Card key={index} data={item} />
      ))}
      <Footer
        totalRows={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default DatasetCards;
