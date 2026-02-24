import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ActionTooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    disabled?: boolean;
}

export function ActionTooltip({ children, content, side = 'top', disabled }: ActionTooltipProps) {
    if (disabled) {
        return <>{children}</>;
    }

    return (
        <Tooltip.Provider delayDuration={100}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    {children}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side={side}
                        sideOffset={8}
                        className="bg-shell-dark-panel text-shell-dark-text text-[11px] px-2 py-1 rounded shadow-lg border border-shell-dark-border animate-in fade-in zoom-in-95 duration-150 z-[1100]"
                    >
                        {content}
                        <Tooltip.Arrow className="fill-shell-dark-panel" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
