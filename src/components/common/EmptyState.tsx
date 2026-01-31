import { type ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}
            >
                {icon || <FileQuestion size={28} color="#8b5cf6" />}
            </div>
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'white',
                    marginBottom: 8,
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    fontSize: 14,
                    color: '#a0a0b0',
                    maxWidth: 280,
                    lineHeight: 1.5,
                    marginBottom: action ? 20 : 0,
                }}
            >
                {description}
            </p>
            {action}
        </div>
    );
};
