import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';

const ThinkingIndicatorComponentView = () => {
  return (
    <ComponentViewLayout
      title="Thinking Indicator"
      description="Animated indicator used to show that AI is processing."
    >
      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection controls={null}>
          <div className="p-8 bg-vca-background border border-vca-border-subtle rounded-vca-md">
            <ThinkingIndicator />
          </div>
        </DemoSection>
      </div>
    </ComponentViewLayout>
  );
};

export default ThinkingIndicatorComponentView;

