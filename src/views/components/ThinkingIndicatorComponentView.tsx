import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';

const ThinkingIndicatorComponentView = () => {
  return (
    <ComponentViewLayout
      title="Thinking Indicator"
      description="Animated indicator showing AI is processing. Displays 3 dots that pulse in sequence."
    >
      {/* Demo Section */}
      <DemoSection controls={null}>
        <ThinkingIndicator />
      </DemoSection>
    </ComponentViewLayout>
  );
};

export default ThinkingIndicatorComponentView;

