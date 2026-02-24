import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EditorSectionProps {
    title?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
    collapsible?: boolean;
    action?: ReactNode;
}

export function EditorSection({ title, children, defaultOpen = true, className, collapsible = false, action }: EditorSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!title) {
        return <div className={cn("space-y-3", className)}>{children}</div>;
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between select-none">
                <div
                    className={cn(
                        "flex items-center gap-2",
                        collapsible ? "cursor-pointer text-shell-muted-strong hover:text-shell-text" : "text-shell-text"
                    )}
                    onClick={() => collapsible && setIsOpen(!isOpen)}
                >
                    {collapsible && (
                        <div className="text-shell-muted">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    )}
                    <h4 className="text-[13px] font-medium text-shell-text">
                        {title}
                    </h4>
                </div>
                {action && <div className="ml-auto">{action}</div>}
            </div>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
