import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-2 rounded-lg border bg-white
          text-secondary-900 placeholder-secondary-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-secondary-50 disabled:text-secondary-500
          transition-colors duration-200
          ${error ? 'border-error ring-error focus:ring-error' : 'border-secondary-300'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-error">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
