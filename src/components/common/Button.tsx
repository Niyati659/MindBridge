import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold 
    rounded-xl transition-all duration-300 
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

    const variants = {
        primary: `
      bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
      hover:from-indigo-600 hover:to-purple-700 
      shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
      hover:-translate-y-0.5 active:translate-y-0
    `,
        secondary: `
      bg-white/10 text-white border border-white/20
      hover:bg-white/20 hover:border-white/30
    `,
        ghost: `
      bg-transparent text-gray-300 
      hover:bg-white/5 hover:text-white
    `
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </button>
    );
};
