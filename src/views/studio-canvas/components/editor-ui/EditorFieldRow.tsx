import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EditorFieldRowProps {
    children: ReactNode;
    className?: string;
}

export function EditorFieldRow({ children, className }: EditorFieldRowProps) {
    return (
        <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
            {children}
        </div>
    );
}
