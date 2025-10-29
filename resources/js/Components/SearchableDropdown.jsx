import { useState, useEffect, useRef, useMemo } from "react";
import TextInput from "@/Components/TextInput";

export default function SearchableDropdown({
  options = [],
  value = '',
  onChange,
  placeholder = "Search...",
  displayKey = 'name',
  valueKey = 'id',
  className = '',
  customOptions = [],
  renderOption,
  renderSelected,
  emptyMessage = "No options found"
}) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options || [];
    return (options || []).filter(option =>
      option[displayKey].toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, displayKey]);

  // Get selected option display text
  const selectedDisplay = useMemo(() => {
    if (renderSelected) {
      return renderSelected(value, options);
    }

    if (!value) return '';
    const selected = options?.find(opt => opt[valueKey] == value);
    return selected ? selected[displayKey] : '';
  }, [value, options, valueKey, displayKey, renderSelected]);

  const handleOptionSelect = (optionValue, displayText = '') => {
    onChange(optionValue, displayText);
    setSearch(displayText);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <TextInput
        type="text"
        placeholder={placeholder}
        value={search || selectedDisplay}
        className="w-full text-sm"
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
          if (!e.target.value) {
            onChange('', '');
          }
        }}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
      />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Custom options (like "All", "None", etc.) */}
          {customOptions.map((customOption, index) => (
            <div
              key={`custom-${index}`}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
              onClick={() => handleOptionSelect(customOption.value, customOption.displayText)}
            >
              <span className={customOption.className || "text-gray-600 dark:text-gray-400"}>
                {customOption.label}
              </span>
            </div>
          ))}

          {/* Filtered options */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option[valueKey]}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                onClick={() => {
                  const displayText = renderOption ? renderOption(option) : option[displayKey];
                  handleOptionSelect(option[valueKey], displayText);
                }}
              >
                {renderOption ? renderOption(option) : option[displayKey]}
              </div>
            ))
          ) : search && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
