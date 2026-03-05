import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef } from 'react';
import { Split, UserRound } from 'lucide-react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';

export type QuickAddNodeType = 'user-turn' | 'turn' | 'condition';

interface ScreenPosition {
    x: number;
    y: number;
}

interface ConnectionQuickAddMenuProps {
    open: boolean;
    position: ScreenPosition | null;
    onSelect: (type: QuickAddNodeType) => void;
    onOptionHover?: (type: QuickAddNodeType | null) => void;
    onCancel: () => void;
}

const MENU_WIDTH = 280;
const MENU_HEIGHT = 120;
const VIEWPORT_PADDING = 12;

const clamp = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
};

export function ConnectionQuickAddMenu({
    open,
    position,
    onSelect,
    onOptionHover,
    onCancel,
}: ConnectionQuickAddMenuProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onCancel();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onCancel]);

    const anchoredPosition = useMemo(() => {
        if (!position || typeof window === 'undefined') return null;

        const left = clamp(
            position.x - MENU_WIDTH / 2,
            VIEWPORT_PADDING,
            window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING
        );
        const top = clamp(
            position.y,
            VIEWPORT_PADDING,
            window.innerHeight - MENU_HEIGHT - VIEWPORT_PADDING
        );

        return { left, top };
    }, [position]);

    if (!open || !anchoredPosition) {
        return null;
    }

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[1200] w-[280px] rounded-xl border border-shell-dark-border bg-shell-dark-panel p-2 shadow-2xl animate-in fade-in zoom-in-98 duration-100 ease-out"
            style={{
                left: anchoredPosition.left,
                top: anchoredPosition.top,
            }}
        >
            <div className="mb-1.5 px-2 text-xs font-medium text-shell-dark-muted">
                Choose node
            </div>
            <div
                className="grid grid-cols-3 gap-1.5"
                onMouseLeave={() => onOptionHover?.(null)}
            >
                <button
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-shell-dark-text transition-colors hover:bg-shell-dark-surface cursor-pointer"
                    onMouseEnter={() => onOptionHover?.('user-turn')}
                    onFocus={() => onOptionHover?.('user-turn')}
                    onClick={() => onSelect('user-turn')}
                >
                    <UserRound size={16} className="text-shell-node-user" />
                    <span className="text-[11px] font-medium">User Turn</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-shell-dark-text transition-colors hover:bg-shell-dark-surface cursor-pointer"
                    onMouseEnter={() => onOptionHover?.('turn')}
                    onFocus={() => onOptionHover?.('turn')}
                    onClick={() => onSelect('turn')}
                >
                    <VcaIcon icon="signal-ai" size="sm" className="text-shell-accent" />
                    <span className="text-[11px] font-medium">AI Turn</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-shell-dark-text transition-colors hover:bg-shell-dark-surface cursor-pointer"
                    onMouseEnter={() => onOptionHover?.('condition')}
                    onFocus={() => onOptionHover?.('condition')}
                    onClick={() => onSelect('condition')}
                >
                    <Split size={16} className="text-shell-node-condition" />
                    <span className="text-[11px] font-medium">Condition</span>
                </button>
            </div>
        </div>,
        document.body
    );
}
