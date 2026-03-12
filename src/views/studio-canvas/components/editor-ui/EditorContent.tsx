import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EditorContentProps {
    children: ReactNode;
    className?: string;
}

export function EditorContent({ children, className }: EditorContentProps) {
    return (
        <div className={cn("flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar px-6 py-5 space-y-7", className)}>
            {children}
        </div>
    );
}
