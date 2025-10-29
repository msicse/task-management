import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function CustomSelectInput({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  className = "",
  children,
  searchable = true,
  multiSelect = false,
  searchPlaceholder = "Search..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Convert children to options array if children are provided
  const optionsArray = children ?
    React.Children.map(children, child => {
      if (child && child.props) {
        return {
          value: child.props.value || '',
          label: child.props.children || ''
        };
      }
      return null;
    }).filter(Boolean)
    : options;

  // Filter options based on search term
  const filteredOptions = optionsArray.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize multi-select values
  useEffect(() => {
    if (multiSelect && value) {
      const values = Array.isArray(value) ? value : value.split(',').filter(Boolean);
      setSelectedValues(values);
    }
  }, [value, multiSelect]);

  // Update selected label for single select or multi-select display
  useEffect(() => {
    if (multiSelect) {
      if (selectedValues.length === 0) {
        setSelectedLabel(placeholder);
      } else if (selectedValues.length === 1) {
        const selected = optionsArray.find(opt => opt.value === selectedValues[0]);
        setSelectedLabel(selected ? selected.label : placeholder);
      } else {
        setSelectedLabel(`${selectedValues.length} items selected`);
      }
    } else {
      const selected = optionsArray.find(opt => opt.value === value);
      setSelectedLabel(selected ? selected.label : placeholder);
    }
  }, [value, selectedValues, optionsArray, placeholder, multiSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSingleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleMultiSelect = (optionValue) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];

    setSelectedValues(newSelectedValues);
    onChange({ target: { value: newSelectedValues } });
  };

  const removeSelectedItem = (optionValue, event) => {
    event.stopPropagation();
    const newSelectedValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newSelectedValues);
    onChange({ target: { value: newSelectedValues } });
  };

  const clearAll = (event) => {
    event.stopPropagation();
    if (multiSelect) {
      setSelectedValues([]);
      onChange({ target: { value: [] } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected value display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-200 cursor-pointer min-h-[38px] flex items-center"
      >
        {multiSelect && selectedValues.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedValues.slice(0, 3).map(val => {
              const option = optionsArray.find(opt => opt.value === val);
              return option ? (
                <span
                  key={val}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => removeSelectedItem(val, e)}
                    className="ml-1 hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
            {selectedValues.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{selectedValues.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <span className="block truncate flex-1">{selectedLabel}</span>
        )}

        <div className="flex items-center ml-2">
          {((!multiSelect && value) || (multiSelect && selectedValues.length > 0)) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-1"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = multiSelect
                  ? selectedValues.includes(option.value)
                  : value === option.value;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => multiSelect ? handleMultiSelect(option.value) : handleSingleSelect(option.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                        : ''
                    }`}
                  >
                    {multiSelect && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent onClick
                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
