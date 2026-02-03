import React from 'react';
import { cn } from '@/utils';
import { VcaIcon } from '../icons';

export type ActionCardProps = {
    status: 'in-progress' | 'complete' | 'success' | 'failure';
    title: string;
    children?: React.ReactNode;
    actionLabel?: string;
    onActionClick?: () => void;
    className?: string;
};

export const ActionCard = ({
    status,
    title,
    children,
    actionLabel,
    onActionClick,
    className,
}: ActionCardProps) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-vca-md w-full max-w-[400px]',
                'bg-vca-surface-tint', // Light blue background
                className
            )}
        >
            <style>{`
                @keyframes ai-pulse {
                    0% { transform: scale(1) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.15) rotate(10deg); opacity: 0.8; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes progress-load {
                    0% { width: 0%; opacity: 1; }
                    50% { width: 70%; opacity: 1; }
                    100% { width: 100%; opacity: 0; }
                }
                .animate-ai-pulse-custom {
                    animation: ai-pulse 2s ease-in-out infinite;
                }
                .animate-progress-load-custom {
                    animation: progress-load 2s ease-in-out infinite;
                }
            `}</style>
            <div className="flex gap-vca-s p-vca-lg items-start">
                {/* Icon */}
                <div className="shrink-0 h-6 flex items-center">
                    {status === 'in-progress' && (
                        <div className="animate-ai-pulse-custom origin-center text-vca-brand-logo-brand">
                            <VcaIcon icon="signal-ai" size="md" />
                        </div>
                    )}
                    {(status === 'complete' || status === 'success') && (
                        <div className="text-vca-accent-4">
                            <VcaIcon icon="signal-success" size="md" />
                        </div>
                    )}
                    {status === 'failure' && (
                        <div className="text-red-600">
                            <VcaIcon icon="signal-error" size="md" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1 grow min-w-0">
                    <div className="font-vca-text text-vca-small-bold-open leading-6 text-vca-text">
                        {title}
                    </div>

                    {(status === 'complete' || status === 'success' || status === 'failure') && children && (
                        <div className="font-vca-text text-vca-small-open text-vca-text mt-0 space-y-2 [&_a]:text-vca-link [&_a]:font-semibold [&_a]:no-underline hover:[&_a]:underline">
                            {children}
                        </div>
                    )}

                    {(status === 'complete' || status === 'success' || status === 'failure') && actionLabel && (
                        <button
                            onClick={onActionClick}
                            className="mt-2 text-left font-vca-text text-vca-small-bold-open text-vca-link hover:underline bg-transparent border-none p-0 cursor-pointer w-fit"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar (Only for in-progress) */}
            {status === 'in-progress' && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/50">
                    <div className="h-full bg-vca-brand-logo-brand animate-progress-load-custom origin-left" />
                </div>
            )}
        </div>
    );
};
