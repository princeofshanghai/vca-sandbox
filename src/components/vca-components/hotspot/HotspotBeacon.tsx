import { cn } from '@/utils';

export type HotspotBeaconProps = {
  className?: string;
};

/**
 * HotspotBeacon - Subtle animated coachmark to indicate interactive targets.
 * Designed to stay lightweight and ambient.
 */
export const HotspotBeacon = ({ className }: HotspotBeaconProps) => {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inline-flex h-5 w-5 items-center justify-center isolate',
        className
      )}
    >
      <span className="absolute h-3 w-3 rounded-full bg-[rgb(var(--shell-node-user)/0.88)] hotspot-ripple-animation" />
      <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-[rgb(var(--shell-node-user)/0.72)] shadow-[0_0_8px_rgba(147,51,234,0.24)] hotspot-dot-pulse-animation" />
    </span>
  );
};
