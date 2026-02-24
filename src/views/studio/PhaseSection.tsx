import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/utils/cn';
import { Plus } from 'lucide-react';

interface PhaseSectionProps {
    id: string;
    title: string;
    description?: string;
    icon: string;
    items: string[]; // Block IDs
    children: React.ReactNode;
    onAddBlock: (e: React.MouseEvent) => void;
}

export const PhaseSection = ({ id, title, description, icon, items, children, onAddBlock }: PhaseSectionProps) => {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'Phase',
            phaseId: id
        }
    });

    return (
        <div ref={setNodeRef} className="group mb-8 last:mb-24">
            {/* Minimalist Header */}
            <div className="flex items-baseline gap-3 mb-4 px-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-sm font-semibold text-shell-text tracking-tight">
                    {title}
                </h3>
                {description && (
                    <span className="text-xs text-shell-muted font-normal">
                        {description}
                    </span>
                )}
            </div>

            {/* Droppable Area */}
            <div className={cn(
                "min-h-[80px] rounded-xl border border-dashed border-shell-border transition-colors p-2 space-y-3",
                items.length === 0 ? "bg-shell-surface-subtle hover:bg-shell-surface" : "bg-transparent border-transparent px-0"
            )}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {children}
                </SortableContext>

                {/* Empty State / Add Placeholder */}
                {items.length === 0 && (
                    <button
                        onClick={onAddBlock}
                        className="w-full h-full min-h-[80px] flex items-center justify-center gap-2 text-shell-muted hover:text-shell-muted-strong transition-colors"
                    >
                        <Plus size={16} />
                        <span className="text-xs">Add to {title.toLowerCase()}</span>
                    </button>
                )}
            </div>

            {/* "Add" hint on hover (if not empty) */}
            {items.length > 0 && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center mt-2">
                    <button
                        onClick={onAddBlock}
                        className="flex items-center gap-1.5 text-xs text-shell-muted hover:text-shell-accent transition-colors py-1 px-3 rounded-full hover:bg-shell-accent-soft"
                    >
                        <Plus size={14} />
                        <span>Add step</span>
                    </button>
                </div>
            )}
        </div>
    );
};
