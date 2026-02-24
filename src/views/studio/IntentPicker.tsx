import { useRef, useEffect } from 'react';
import { User, MessageSquare, Info, Zap } from 'lucide-react';
import { BlockType, AIBlockVariant } from './types';

interface IntentPickerProps {
    onSelect: (type: BlockType, variant?: AIBlockVariant) => void;
    onClose: () => void;
    position: { x: number, y: number };
}

export const IntentPicker = ({ onSelect, onClose, position }: IntentPickerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Simple style to keep it on screen (basic overflow protection could be added)
    const style = {
        top: position.y,
        left: position.x,
    };

    return (
        <div
            ref={ref}
            className="fixed z-50 w-64 bg-shell-bg rounded-xl shadow-xl border border-shell-border overflow-hidden flex flex-col animation-in fade-in zoom-in-95 duration-100"
            style={style}
        >
            <div className="bg-shell-surface-subtle px-3 py-2 border-b border-shell-border-subtle">
                <span className="text-xs font-semibold text-shell-muted uppercase tracking-wider">Add Step</span>
            </div>

            <div className="p-1.5 space-y-0.5">
                <Option
                    icon={<User size={16} />}
                    label="User says..."
                    description="User asks a question or replies"
                    onClick={() => onSelect('user')}
                />

                <div className="h-px bg-shell-border-subtle my-1 mx-2" />

                <h4 className="px-3 py-1 text-[10px] text-shell-muted font-medium font-mono uppercase">AI Responses</h4>

                <Option
                    icon={<MessageSquare size={16} />}
                    label="Message"
                    description="Standard text response"
                    onClick={() => onSelect('ai', 'message')}
                />
                <Option
                    icon={<Info size={16} />}
                    label="Guide / Info"
                    description="Rich content with sources"
                    onClick={() => onSelect('ai', 'info')}
                />
                <Option
                    icon={<Zap size={16} />}
                    label="Status"
                    description="Execute a task or check"
                    onClick={() => onSelect('ai', 'status')}
                />
            </div>
        </div>
    );
};

const Option = ({ icon, label, description, onClick }: { icon: React.ReactNode, label: string, description: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-shell-accent-soft transition-colors group"
    >
        <div className="mt-0.5 text-shell-muted group-hover:text-shell-accent transition-colors">
            {icon}
        </div>
        <div>
            <div className="text-sm font-medium text-shell-text group-hover:text-shell-accent-text">{label}</div>
            <div className="text-[10px] text-shell-muted group-hover:text-shell-accent-text/80 leading-tight">{description}</div>
        </div>
    </button>
);
