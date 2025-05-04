import { useState } from 'react';

type Option = {
  label: string;
  value: string;
};

type CustomComboboxProps = {
  options: Option[];
  selectedValue: Option[];
  onChange: (value: Option[]) => void;
  onInput?: (value: string) => void;
  placeholder?: string;
};


const CustomCombobox: React.FC<CustomComboboxProps> = ({
  options,
  selectedValue,
  onChange,
  onInput,
  placeholder,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredOptions = options.filter(
    (option) =>
      !selectedValue.some((selected) => selected.value === option.value) &&
      option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onInput?.(value); // Pass the input value to parent component
    setIsDropdownOpen(true); // Keep dropdown open while typing
  };

  const handleSelectOption = (option: Option) => {
    // Prevent adding duplicate values
    if (selectedValue.some((item) => item.value === option.value)) {
      return;
    }
    // Add the selected option to the list
    onChange([...selectedValue, option]);
    setSearchValue(''); // Clear input after selection
    setIsDropdownOpen(false); // Close dropdown
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        id="combobox"
        value={searchValue}
        onChange={handleInputChange}
        className="mt-1 block w-full px-3 py-1 border border-gray-100 placeholder:text-sm"
        placeholder={placeholder}
      />
      {isDropdownOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 rounded-2  px-1 py-2 z-1 shadow-basicXl mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="cursor-pointer px-4 py-2 hover:bg-baseGraySlateSolid3 rounded-2"
              onClick={() => handleSelectOption(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomCombobox;
