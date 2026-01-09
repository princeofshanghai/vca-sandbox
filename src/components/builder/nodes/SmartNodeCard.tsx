import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils';


interface SmartNodeCardProps {
    title: string;
    icon?: string;
    colorClass?: string;
    children?: React.ReactNode;
    selected?: boolean;
    handles?: 'source' | 'target' | 'both';
}

export const SmartNodeCard = memo(({
    title,

    colorClass = 'bg-blue-600',
    children,
    selected,
    handles = 'both'
}: SmartNodeCardProps) => {
    return (
        <div className={cn(
            "min-w-[280px] bg-white rounded-lg shadow-sm border-2 transition-all duration-200",
            selected ? "border-blue-500 shadow-md ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
        )}>
            {/* Handles */}
            {(handles === 'target' || handles === 'both') && (
                <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            )}
            {(handles === 'source' || handles === 'both') && (
                <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
            )}

            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white", colorClass)}>
                    {/* Placeholder for Icon - in real app we'd map string to Lucide/VCA Icon */}
                    <span className="text-xs font-bold">{title[0]}</span>
                </div>
                <span className="font-semibold text-sm text-gray-700">{title}</span>
            </div>

            {/* Body */}
            <div className="p-3 text-sm text-gray-600">
                {children}
            </div>
        </div>
    );
});
