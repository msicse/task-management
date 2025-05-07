import React from 'react';
import Select from 'react-select';

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isClearable = false,
  isMulti = false,
  className = '',
  ...props
}) {
  // Default custom styles for better integration with the app's design
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#9ca3af',
      },
      borderRadius: '0.375rem',
      padding: '2px',
      backgroundColor: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#6366f1'
        : state.isFocused
          ? '#e0e7ff'
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
      ':active': {
        backgroundColor: '#6366f1',
        color: 'white',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#4f46e5',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#4f46e5',
      ':hover': {
        backgroundColor: '#4f46e5',
        color: 'white',
      },
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  // For single select, we need to convert the value to the format expected by react-select
  const selectValue = isMulti
    ? value
    : options?.find(option => option.value === value) || null;

  // Handle the onChange event
  const handleChange = (selectedOption) => {
    if (isMulti) {
      onChange(selectedOption);
    } else {
      onChange({ target: { value: selectedOption ? selectedOption.value : '' } });
    }
  };

  return (
    <Select
      options={options}
      value={selectValue}
      onChange={handleChange}
      styles={customStyles}
      className={className}
      isClearable={isClearable}
      isMulti={isMulti}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      {...props}
    />
  );
}
