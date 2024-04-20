import React from 'react';
import { Button, SearchInput, Select, Text } from 'opub-ui';

interface TableHeaderProps {
  filterEnabled?: boolean;
  searchEnabled?: boolean;
  countEnabled?: boolean;
  actionEnabled?: boolean;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onActionClick?: () => void;
  count: any;
  label: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  filterEnabled = true,
  searchEnabled = true,
  countEnabled = true,
  actionEnabled = true,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onActionClick,
  count,
  label,
}) => {
  const searchRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-2 bg-baseBlueAlpha4 px-4 py-2">
      {countEnabled && (
        <span className="text-gray-600">
          Showing {count} of {count} {label}
        </span>
      )}
      {searchEnabled && (
        <div className="w-full max-w-[400px]">
          <SearchInput
            label={'Search'}
            name={'Search'}
            ref={searchRef}
            placeholder={`Search in ${label}`}
            defaultValue={searchQuery}
            onChange={(e) => onSearchChange(e)}
          />
        </div>
      )}

      {filterEnabled && (
        <div className="flex items-center gap-2">
          <Text variant="bodyLg" color="highlight">
            Filter:
          </Text>
          <div className="w-28">
            <Select
              label=""
              labelInline
              name="select"
              options={[
                {
                  label: 'All',
                  value: 'all',
                },
                {
                  label: 'Latest',
                  value: 'latest',
                },
              ]}
              value={selectedFilter}
              onChange={(e) => onFilterChange(e)}
            />
          </div>
        </div>
      )}

      {actionEnabled && <Button onClick={onActionClick}>Add Resources</Button>}
    </div>
  );
};

export default TableHeader;
