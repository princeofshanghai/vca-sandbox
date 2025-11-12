import { DemoSection } from '@/components/component-library/DemoSection';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';

const ThinkingIndicatorComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Thinking Indicator</h1>
      <p className="text-md text-gray-500 mb-12">
        Animated dots that indicate the AI is processing or thinking. Displays 3 dots that pulse in sequence.
      </p>
      
      {/* Demo Section */}
      <DemoSection controls={null}>
        <ThinkingIndicator />
      </DemoSection>
    </div>
  );
};

export default ThinkingIndicatorComponentView;

