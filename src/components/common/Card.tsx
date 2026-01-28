import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    glow = false,
    ...props
}) => {
    const hoverStyles = hover ? `
    cursor-pointer
    hover:-translate-y-1 hover:bg-white/10 
    hover:border-white/25 hover:shadow-xl
  ` : "";

    const glowStyles = glow ? "card-glow" : "";

    return (
        <div
            className={`
        glass-panel p-6 
        transition-all duration-300
        ${hoverStyles} 
        ${glowStyles}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};
