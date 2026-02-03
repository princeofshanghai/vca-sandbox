import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ActionTooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export function ActionTooltip({ children, content, side = 'top' }: ActionTooltipProps) {
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
                        className="bg-gray-800 text-white text-[11px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in-95 duration-150 z-[1100]"
                    >
                        {content}
                        <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
