import { cn } from '@/utils';
import { Avatar, AvatarFallbackTone } from '../avatar';
import { VcaIcon, VcaIconName } from '../icons';
import { Button } from '../buttons';
import { HotspotBeacon } from '../hotspot';

export type ConfirmationVisualType = 'avatar' | 'icon' | 'none';

const FALLBACK_AVATAR_TONES: AvatarFallbackTone[] = ['amber', 'rose', 'green', 'blue', 'taupe'];

const getFallbackToneFromSeed = (seed: string): AvatarFallbackTone => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return FALLBACK_AVATAR_TONES[Math.abs(hash) % FALLBACK_AVATAR_TONES.length];
};

export interface ConfirmationEntity {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    iconName?: VcaIconName;
    visualType?: ConfirmationVisualType;
}

export interface ConfirmationCardProps {
    item: ConfirmationEntity;
    confirmLabel?: string;
    rejectLabel?: string;
    onConfirm?: (item: ConfirmationEntity) => void;
    onReject?: (item: ConfirmationEntity) => void;
    disabled?: boolean;
    className?: string;
    showConfirmHotspot?: boolean;
    showRejectHotspot?: boolean;
}

export const ConfirmationCard = ({
    item,
    confirmLabel = 'Yes, confirm',
    rejectLabel = 'No, not this person',
    onConfirm,
    onReject,
    disabled = false,
    className,
    showConfirmHotspot = false,
    showRejectHotspot = false,
}: ConfirmationCardProps) => {
    const resolvedVisualType: ConfirmationVisualType =
        item.imageUrl
            ? 'avatar'
            : item.visualType || (item.iconName ? 'icon' : 'none');
    const showAvatar = resolvedVisualType === 'avatar';
    const showIcon = resolvedVisualType === 'icon';
    const fallbackTone = getFallbackToneFromSeed(item.id || item.title || 'candidate');

    return (
        <div className={cn("w-full max-w-sm", className)}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-transparent bg-white p-3">
                    {(showAvatar || showIcon) && (
                        <div className="relative h-8 w-8 shrink-0">
                            {showAvatar ? (
                                <Avatar
                                    size={32}
                                    src={item.imageUrl}
                                    alt={item.title ? `${item.title} avatar` : 'Candidate avatar'}
                                    fallbackStyle="silhouette"
                                    fallbackTone={fallbackTone}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-vca-background-neutral-soft text-vca-text-meta">
                                    <VcaIcon icon={item.iconName || 'user'} size="md" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <p className="truncate font-vca-text text-vca-small-bold text-vca-text">
                            {item.title}
                        </p>
                        {item.subtitle && (
                            <p className="mt-0.5 truncate font-vca-text text-vca-xsmall text-vca-text-meta">
                                {item.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0">
                    <div className="relative">
                        {showConfirmHotspot && (
                            <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                        )}
                        <Button
                            variant="secondary"
                            emphasis={true}
                            disabled={disabled}
                            onClick={() => onConfirm?.(item)}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                    <div className="relative">
                        {showRejectHotspot && (
                            <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                        )}
                        <Button
                            variant="tertiary"
                            emphasis={false}
                            disabled={disabled}
                            onClick={() => onReject?.(item)}
                        >
                            {rejectLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
