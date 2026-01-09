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
          <ThinkingIndicator />
        </DemoSection>
      </div>
    </ComponentViewLayout>
  );
};

export default ThinkingIndicatorComponentView;

