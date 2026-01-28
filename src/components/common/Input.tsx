import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-[var(--color-text-muted)] ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-2.5 rounded-xl
          bg-white/50 backdrop-blur-sm border border-white/60
          focus:bg-white/80 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
          outline-none transition-all duration-200
          placeholder:text-slate-400 text-[var(--color-text-main)]
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-500 ml-1">{error}</span>
            )}
        </div>
    );
};
