import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function DateInput({ className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    const handleIconClick = () => {
        if (input.current && input.current.showPicker) {
            try {
                input.current.showPicker();
            } catch (error) {
                // Fallback: focus and click the input
                input.current.focus();
                input.current.click();
            }
        } else {
            // Fallback for browsers that don't support showPicker
            input.current.focus();
            input.current.click();
        }
    };

    return (
        <div className="date-input-wrapper relative">
            <input
                {...props}
                type="date"
                className={
                    'border-gray-300 dark:text-white dark:border-gray-700 dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm w-full ' +
                    className
                }
                ref={input}
            />
            {/* Custom calendar icon for dark mode */}
            <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 opacity-0 dark:opacity-70 hover:dark:opacity-100 transition-opacity pointer-events-none dark:pointer-events-auto"
                onClick={handleIconClick}
                tabIndex={-1}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="white"
                    className="w-4 h-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
});
