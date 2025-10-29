import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MultipleSearchableSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  searchable = true,
  multiSelect = true,
  maxItems = null,
  showSelectedCount = true,
  allowClear = true,
  closeOnSelect = false, // Close dropdown after selection (useful for single select)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Ensure value is always an array for consistency
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option objects
  const selectedOptions = selectedValues
    .map(val => options.find(opt => opt.value === val))
    .filter(Boolean);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionClick = (option) => {
    if (disabled) return;

    let newValue;

    if (multiSelect) {
      // Multiple selection logic
      if (selectedValues.includes(option.value)) {
        // Remove if already selected
        newValue = selectedValues.filter(val => val !== option.value);
      } else {
        // Add if not selected (check max items limit)
        if (maxItems && selectedValues.length >= maxItems) {
          return; // Don't add if max limit reached
        }
        newValue = [...selectedValues, option.value];
      }
    } else {
      // Single selection logic
      newValue = option.value;
      if (closeOnSelect) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    onChange(newValue);

    // Close dropdown if single select or closeOnSelect is true
    if (!multiSelect || closeOnSelect) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveItem = (valueToRemove, event) => {
    event.stopPropagation();
    if (disabled) return;

    const newValue = multiSelect
      ? selectedValues.filter(val => val !== valueToRemove)
      : [];

    onChange(newValue);
  };

  const handleClearAll = (event) => {
    event.stopPropagation();
    if (disabled) return;
    onChange(multiSelect ? [] : '');
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }

    if (!multiSelect) {
      return selectedOptions[0]?.label || '';
    }

    if (showSelectedCount && selectedOptions.length > 2) {
      return `${selectedOptions.length} items selected`;
    }

    return selectedOptions.map(opt => opt.label).join(', ');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Select Trigger - use div (role=button) to avoid nested actual <button> elements */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => { if (!disabled) handleToggleDropdown(); }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleDropdown();
          }
        }}
        aria-disabled={disabled}
        className={`
          relative w-full cursor-default rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm
          ${disabled
            ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
          ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'}
        `}
      >
        <div className="flex items-center">
          {/* Selected Items Display */}
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {multiSelect && selectedOptions.length > 0 ? (
              selectedOptions.length <= 2 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium"
                  >
                    {option.label}
                    {allowClear && !disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(option.value, e)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-gray-700 dark:text-gray-300">
                  {selectedOptions.length} items selected
                </span>
              )
            ) : (
              <span className={selectedOptions.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                {getDisplayText()}
              </span>
            )}
          </div>

          {/* Clear All Button */}
          {allowClear && selectedOptions.length > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearAll(e); }}
              className="mr-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const isDisabled = option.disabled ||
                  (maxItems && !isSelected && selectedValues.length >= maxItems);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !isDisabled && handleOptionClick(option)}
                    disabled={isDisabled}
                    className={`
                      w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none
                      ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="block truncate">{option.label}</span>
                    {multiSelect && isSelected && (
                      <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleSearchableSelect;
