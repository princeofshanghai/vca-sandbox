import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface AttachedStatusTagProps {
    tone?: 'default' | 'cinematicDark';
    children: ReactNode;
    className?: string;
}

export function AttachedStatusTag({
    tone = 'default',
    children,
    className,
}: AttachedStatusTagProps) {
    const toneClassName = tone === 'cinematicDark'
        ? 'border border-amber-400/35 bg-amber-500/15 text-amber-200'
        : 'border border-amber-200 bg-amber-100 text-amber-800';

    return (
        <span
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute -right-9 -top-3 inline-flex h-5 items-center rounded-full px-1.5 text-[10px] font-semibold shadow-sm',
                toneClassName,
                className
            )}
        >
            {children}
        </span>
    );
}
