import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Plus } from 'lucide-react';
import { Avatar, getAvatarFallbackTone } from '@/components/vca-components/avatar';
import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';
import { cn } from '@/utils/cn';

type VisualType = 'avatar' | 'icon' | 'none';
type CuratedIconName = 'building' | 'document' | 'messages';
type LeadingVisualPreset = 'none' | 'avatar' | CuratedIconName;

interface LeadingVisualValue {
    visualType?: VisualType;
    imageUrl?: string;
    iconName?: string;
}

interface EditorLeadingVisualFieldProps {
    value: LeadingVisualValue;
    onChange: (nextValue: {
        visualType: VisualType;
        imageUrl?: string;
        iconName?: VcaIconName;
    }) => void;
    readOnly?: boolean;
    seed?: string;
    className?: string;
    ariaLabel?: string;
}

const CURATED_PRESETS: Array<{ value: LeadingVisualPreset; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'avatar', label: 'Avatar' },
    { value: 'building', label: 'Building' },
    { value: 'document', label: 'Document' },
    { value: 'messages', label: 'Messages' },
];

const isCuratedIconName = (iconName?: string): iconName is CuratedIconName =>
    iconName === 'building' || iconName === 'document' || iconName === 'messages';

const resolveActivePreset = (value: LeadingVisualValue): LeadingVisualPreset | undefined => {
    if (value.imageUrl || value.visualType === 'avatar') {
        return 'avatar';
    }

    if (isCuratedIconName(value.iconName)) {
        return value.iconName;
    }

    if (value.visualType === 'none' || (!value.visualType && !value.iconName && !value.imageUrl)) {
        return 'none';
    }

    return undefined;
};

interface LeadingVisualPreviewProps {
    value: LeadingVisualValue;
    seed: string;
    variant?: 'trigger' | 'popover';
}

function LeadingVisualPreview({ value, seed, variant = 'trigger' }: LeadingVisualPreviewProps) {
    const tone = getAvatarFallbackTone(seed);

    if (value.imageUrl || value.visualType === 'avatar') {
        return (
            <Avatar
                size={24}
                src={value.imageUrl}
                alt="Avatar"
                fallbackStyle="silhouette"
                fallbackTone={tone}
            />
        );
    }

    if (value.visualType === 'icon' && value.iconName) {
        return (
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-shell-surface-subtle text-shell-muted">
                <VcaIcon icon={value.iconName as VcaIconName} size="sm" />
            </div>
        );
    }

    if (variant === 'popover') {
        return (
            <span className="text-[10px] font-medium leading-none text-shell-muted-strong">
                None
            </span>
        );
    }

    return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-shell-surface-subtle text-shell-muted-strong">
            <Plus className="h-3.5 w-3.5" />
        </div>
    );
}

export function EditorLeadingVisualField({
    value,
    onChange,
    readOnly = false,
    seed = 'item',
    className,
    ariaLabel = 'Choose leading visual',
}: EditorLeadingVisualFieldProps) {
    const [open, setOpen] = useState(false);
    const activePreset = resolveActivePreset(value);

    const selectPreset = (preset: LeadingVisualPreset) => {
        if (preset === 'none') {
            onChange({
                visualType: 'none',
                imageUrl: undefined,
                iconName: undefined,
            });
            setOpen(false);
            return;
        }

        if (preset === 'avatar') {
            onChange({
                visualType: 'avatar',
                imageUrl: undefined,
                iconName: undefined,
            });
            setOpen(false);
            return;
        }

        onChange({
            visualType: 'icon',
            imageUrl: undefined,
            iconName: preset,
        });
        setOpen(false);
    };

    return (
        <div className={cn("flex shrink-0 flex-col gap-1.5", className)}>
            <span
                aria-hidden="true"
                className="invisible text-[11px] font-medium text-shell-muted-strong"
            >
                Visual
            </span>
            <Popover.Root open={readOnly ? false : open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        disabled={readOnly}
                        aria-label={ariaLabel}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-shell-surface transition-colors",
                            "hover:border-shell-accent-border hover:bg-shell-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/20",
                            "disabled:cursor-not-allowed disabled:opacity-70",
                            open && "border-shell-accent-border bg-shell-surface-subtle"
                        )}
                    >
                        <LeadingVisualPreview value={value} seed={seed} />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={8}
                        className="z-[1101] w-[168px] rounded-xl border border-shell-border bg-shell-bg p-2 shadow-[0_20px_48px_rgb(15_23_42/0.18)]"
                        data-editor-keep-open
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onCloseAutoFocus={(event) => event.preventDefault()}
                    >
                        <div className="grid grid-cols-3 gap-1.5">
                            {CURATED_PRESETS.map((preset) => {
                                const isSelected = activePreset === preset.value;
                                const previewValue: LeadingVisualValue =
                                    preset.value === 'none'
                                        ? { visualType: 'none' }
                                        : preset.value === 'avatar'
                                            ? { visualType: 'avatar' }
                                            : { visualType: 'icon', iconName: preset.value };

                                return (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        title={preset.label}
                                        aria-label={preset.label}
                                        aria-pressed={isSelected}
                                        onClick={() => selectPreset(preset.value)}
                                        className={cn(
                                            "relative flex h-11 w-11 items-center justify-center rounded-xl border border-shell-border bg-shell-surface transition-colors",
                                            "hover:border-shell-accent-border hover:bg-shell-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/20",
                                            isSelected && "border-shell-accent-border bg-shell-accent-soft"
                                        )}
                                    >
                                        <LeadingVisualPreview
                                            value={previewValue}
                                            seed={seed}
                                            variant="popover"
                                        />
                                        {isSelected && (
                                            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-shell-accent text-white">
                                                <Check className="h-2.5 w-2.5" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}
