type DemoSectionProps = {
  children: React.ReactNode;
  controls: React.ReactNode;
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
export const DemoSection = ({ children, controls }: DemoSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Demo</h2>
      
      {/* Unified card container */}
      <div className="border border-gray-200 rounded-lg mb-12 overflow-hidden">
        {/* Demo area with gray background */}
        <div className="bg-gray-50 p-12">
          <div className="flex items-center justify-center min-h-[200px]">
            {children}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Controls area with white background */}
        <div className="bg-white p-6">
          {controls}
        </div>
      </div>
    </div>
  );
};

