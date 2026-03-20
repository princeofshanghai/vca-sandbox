import { cn } from '@/utils/cn';

type ShareViewOnlyBadgeTone = 'default' | 'cinematicDark';

const toneClassNames: Record<ShareViewOnlyBadgeTone, string> = {
    default: 'border border-shell-accent-border/80 bg-shell-accent-soft text-shell-accent-text',
    cinematicDark:
        'border border-shell-dark-accent/30 bg-shell-dark-accent-soft text-shell-dark-accent-text',
};

type ShareViewOnlyBadgeProps = {
    tone?: ShareViewOnlyBadgeTone;
    className?: string;
};

export const ShareViewOnlyBadge = ({
    tone = 'default',
    className,
}: ShareViewOnlyBadgeProps) => (
    <span
        className={cn(
            'inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-md px-2 text-[10px] font-medium leading-none uppercase tracking-[0.08em]',
            toneClassNames[tone],
            className
        )}
    >
        View only
    </span>
);
