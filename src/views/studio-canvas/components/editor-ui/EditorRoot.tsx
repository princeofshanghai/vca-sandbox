import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EditorRootProps {
    children: ReactNode;
    className?: string;
}

export function EditorRoot({ children, className }: EditorRootProps) {
    return (
        <div className={cn("flex flex-col h-full w-full bg-white", className)}>
            {children}
        </div>
    );
}
