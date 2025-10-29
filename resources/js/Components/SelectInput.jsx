import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', disabled = false, options = [], children, ...props },
    ref
) {
    const select = ref ? ref : useRef();

    useEffect(() => {
        if (props.isFocused) {
            select.current.focus();
        }
    }, [props.isFocused]);

    return (
        <select
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm dark:bg-slate-900 relative ' +
                className
            }
            ref={select}
            disabled={disabled}
        >
            {children || options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
});
