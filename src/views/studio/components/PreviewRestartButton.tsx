import { RotateCcw } from 'lucide-react';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { PreviewHeaderActionButton } from './PreviewHeaderActionButton';
import { AttachedStatusTag } from './AttachedStatusTag';

interface PreviewRestartButtonProps {
    tone?: 'default' | 'cinematicDark';
    showIndicator?: boolean;
    onClick: () => void;
}

export function PreviewRestartButton({
    tone = 'default',
    showIndicator = false,
    onClick,
}: PreviewRestartButtonProps) {
    return (
        <ActionTooltip content="Restart" shortcut="R" side="bottom">
            <PreviewHeaderActionButton
                tone={tone}
                onClick={onClick}
                aria-keyshortcuts="R"
            >
                <RotateCcw size={14} />
                Restart
                {showIndicator ? (
                    <AttachedStatusTag tone={tone}>
                        New changes
                    </AttachedStatusTag>
                ) : null}
            </PreviewHeaderActionButton>
        </ActionTooltip>
    );
}
