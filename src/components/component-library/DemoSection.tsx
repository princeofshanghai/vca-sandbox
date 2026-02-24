import { cn } from '@/utils/cn';

type DemoSectionProps = {
  children: React.ReactNode;
  controls?: React.ReactNode;
  title?: string;
  demoAreaClassName?: string;
  demoContentClassName?: string;
};

/**
 * DemoSection - Consistent layout for interactive component demos
 * 
 * Usage:
 * <DemoSection
 *   controls={<YourControlsHere />}
 * >
 *   <YourComponentDemo />
 * </DemoSection>
 */
export const DemoSection = ({
  children,
  controls,
  title = 'Demo',
  demoAreaClassName,
  demoContentClassName,
}: DemoSectionProps) => {
  const hasControls = controls !== null && controls !== undefined;

  return (
    <div>
      <h2 className="text-xl font-medium text-shell-text mb-4 tracking-tight">{title}</h2>
      
      {/* Unified card container */}
      <div className="border border-shell-border rounded-lg mb-12 overflow-hidden">
        {/* Demo area */}
        <div className={cn("bg-shell-surface-subtle p-8", demoAreaClassName)}>
          <div className={cn("flex items-center justify-center min-h-[120px]", demoContentClassName)}>
            {children}
          </div>
        </div>

        {hasControls && (
          <>
            {/* Divider */}
            <div className="border-t border-shell-border" />

            {/* Controls area */}
            <div className="bg-shell-bg p-4">
              <p className="mb-3 text-xs font-medium text-shell-muted">
                Controls
              </p>
              {controls}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
