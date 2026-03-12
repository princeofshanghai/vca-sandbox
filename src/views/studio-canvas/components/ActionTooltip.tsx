import * as React from 'react';
import { ShellTooltip } from '@/components/shell';

interface ActionTooltipProps {
    children: React.ReactNode;
    content: string;
    shortcut?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    disabled?: boolean;
}

export function ActionTooltip({ children, content, shortcut, side = 'top', disabled }: ActionTooltipProps) {
    return (
        <ShellTooltip label={content} shortcut={shortcut} side={side} disabled={disabled}>
            {children}
        </ShellTooltip>
    );
}
