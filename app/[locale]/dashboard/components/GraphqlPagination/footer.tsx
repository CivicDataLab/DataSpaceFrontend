import React from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import { IconButton, Select, Text } from 'opub-ui';

const pageSizeOptions = [9, 18, 36];


interface FooterProps {
  totalRows: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Footer: React.FC<FooterProps> = ({
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalRows / pageSize);

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleJumpToPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(event.target.value);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const handlePageSizeChange = (event: any) => {
    const newSize = parseInt(event as string);
    if (!isNaN(newSize) && newSize > 0) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <div className="flex w-auto mt-4 items-center gap-8 overflow-x-auto bg-surfaceDefault rounded-4 px-4 py-2 sm:px-6 sm:py-4 md:justify-end lg:justify-end">
      <Select
        labelInline
        label="Rows: "
        options={pageSizeOptions.map((value) => ({
          value: String(value),
          label: String(value),
        }))}
        value={String(pageSize)}
        onChange={(e) => {
          handlePageSizeChange(e);
        }}
        name={''}
      />

      <div className="hidden md:block lg:block">
        <Text
          noBreak
          variant="bodyMd"
        >{`Page ${currentPage} of ${totalPages}`}</Text>
      </div>
      <div className="md:hidden lg:hidden">
        <Text noBreak variant="bodyMd">{`${currentPage}/${totalPages}`}</Text>
      </div>
      <div className="flex">
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          icon={IconChevronsLeft}
        >
          First Page
        </IconButton>
        <IconButton
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          icon={IconChevronLeft}
        >
          Previous Page
        </IconButton>
        <IconButton
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          icon={IconChevronRight}
        >
          Next Page
        </IconButton>
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          icon={IconChevronsRight}
        >
          Last Page
        </IconButton>
      </div>
    </div>
  );
};

export default Footer;
