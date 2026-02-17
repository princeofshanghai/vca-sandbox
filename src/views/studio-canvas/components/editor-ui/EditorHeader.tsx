import { ReactNode } from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EditorHeaderProps {
    icon?: LucideIcon;
    title: string;
    onClose?: () => void;
    className?: string;
    actions?: ReactNode;
}

export function EditorHeader({ icon: Icon, title, onClose, className, actions }: EditorHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0", className)}>
            <div className="flex items-center gap-2.5 overflow-hidden">
                {Icon && (
                    <div className="p-1.5 bg-gray-50 rounded-md text-gray-500">
                        <Icon size={16} />
                    </div>
                )}
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {title}
                </h3>
            </div>

            <div className="flex items-center gap-2">
                {actions}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
