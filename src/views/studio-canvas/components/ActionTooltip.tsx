import * as React from 'react';
import { ShellTooltip } from '@/components/shell';

interface ActionTooltipProps {
    children: React.ReactNode;
    content: string;
    description?: string;
    shortcut?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    disabled?: boolean;
}

export function ActionTooltip({ children, content, description, shortcut, side = 'top', disabled }: ActionTooltipProps) {
    return (
        <ShellTooltip label={content} description={description} shortcut={shortcut} side={side} disabled={disabled}>
            {children}
        </ShellTooltip>
    );
}
