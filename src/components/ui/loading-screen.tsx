import { cn } from '@/utils/cn';
import VcaLogo from '@/components/VcaLogo';

interface LoadingScreenProps {
    className?: string;
    /**
     * If true, the loader will take up the full screen height/width fixed.
     * If false, it acts as a block element (useful for content areas).
     */
    fullScreen?: boolean;
}

export const LoadingScreen = ({ className, fullScreen = false }: LoadingScreenProps) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center bg-shell-bg z-50",
                fullScreen ? "fixed inset-0" : "w-full h-full min-h-[400px]",
                className
            )}
        >
            <style>
                {`
                    @keyframes loading-bar {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                    .animate-loading-bar {
                        animation: loading-bar 1.5s infinite ease-in-out;
                    }
                `}
            </style>

            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="relative">
                    <VcaLogo className="h-8 block pointer-events-none select-none" />
                </div>

                {/* Loading Line */}
                <div className="w-[140px] h-[3px] bg-shell-border-subtle rounded-full overflow-hidden relative">
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-shell-accent animate-loading-bar origin-left"
                        style={{
                            width: '50%',
                            // We start off-screen left and move to off-screen right
                            // But wait, keyframe transform needs to target the parent container's width context?
                            // Actually a better way for indeterminate is:
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
