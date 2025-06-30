import Image from 'next/image';
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
  data: any;
};

const EntitySection = ({
  title,
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  onRemove,
  data,
}: EntitySectionProps) => (
  <div>
    <Text variant="headingMd">{title}</Text>
    <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
      <div className="flex w-full flex-wrap items-start gap-5  lg:flex-nowrap">
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
            <div className="flex flex-col items-center gap-2" key={item.value}>
              <div className="rounded-4 bg-surfaceDefault p-4 shadow-basicMd">
                <Image
                  src={
                    data?.find((org: any) => org.id === item.value)?.logo?.url
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                          data?.find((org: any) => org.id === item.value)?.logo
                            ?.url
                        }`
                      : '/org.png'
                  }
                  alt={item.label}
                  width={140}
                  height={100}
                  className="object-contain"
                />
              </div>
              <Button kind="tertiary" onClick={() => onRemove(item)}>
                <div className="flex flex-col items-center gap-2 rounded-2 bg-greyExtralight p-2">
                  <div className="flex gap-2 items-center ">
                    <Text className="line-clamp-2 max-w-40 " title={item.label}>
                      {item.label}
                    </Text>
                    <Icon source={Icons.cross} size={18} />
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default EntitySection;
