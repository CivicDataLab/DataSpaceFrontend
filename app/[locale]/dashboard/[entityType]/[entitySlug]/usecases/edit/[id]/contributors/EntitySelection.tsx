import { Button, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
import CustomCombobox from './CustomCombobox';

type Option = { label: string; value: string };

type EntitySectionProps = {
  title: string;
  label: string;
  placeholder: string;
  options: Option[];
  selectedValues: Option[];
  onChange: (values: Option[]) => void;
  onRemove: (value: Option) => void;
};

const EntitySection = ({
  title,
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  onRemove,
}: EntitySectionProps) => (
  <div>
    <Text variant="headingMd">{title}</Text>
    <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
      <div className="flex w-full flex-wrap items-end gap-5  lg:flex-nowrap">
        <div className="w-full lg:w-2/6">
          <Text>{label}</Text>
          <CustomCombobox
            options={options}
            selectedValue={selectedValues}
            placeholder={placeholder}
            onChange={(value: Option[]) =>
              onChange([
                ...selectedValues,
                ...value.filter(
                  (val) =>
                    !selectedValues.some((item) => item.value === val.value)
                ),
              ])
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 lg:mt-0">
          {selectedValues.map((item) => (
            <Button
              key={item.value}
              kind="tertiary"
              onClick={() => onRemove(item)}
            >
              <div className="flex items-center gap-2 rounded-2 p-2">
                <Text>{item.label}</Text>
                <Icon source={Icons.cross} size={18} />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default EntitySection;
