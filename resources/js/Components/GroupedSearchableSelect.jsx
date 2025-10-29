import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function GroupedSearchableSelect({
  groups = [],
  value = "",
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Flatten options for search
  const allOptions = groups.flatMap(group => group.options.map(opt => ({ ...opt, group: group.label })));
  const filteredGroups = searchTerm
    ? groups
        .map(group => ({
            label: group.label,
            options: group.options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
        }))
        .filter(group => group.options.length > 0)
    : groups;

  // Get selected option object
  const selectedOption = allOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm("");
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getDisplayText = () => {
    return selectedOption ? `${selectedOption.label} (${selectedOption.group})` : placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggleDropdown}
        className={`relative w-full cursor-default rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 ${isOpen ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-300 dark:border-gray-600"}`}
      >
        <span className={selectedOption ? "" : "text-gray-500 dark:text-gray-400"}>{getDisplayText()}</span>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
          {/* Search Input */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Grouped Options */}
          {filteredGroups.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">No options found</div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.label}>
                <div className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-800">{group.label}</div>
                {group.options.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick({ ...option, group: group.label })}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-gray-100`}
                  >
                    <span className="block truncate">{option.label}</span>
                    {value === option.value && (
                      <span className="ml-2 text-indigo-600 dark:text-indigo-300 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
