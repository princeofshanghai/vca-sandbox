import { useState } from 'react';
import { Feedback, FeedbackValue } from '@/components/vca-components/feedback';
import { Message } from '@/components/vca-components/messages';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const FeedbackComponentView = () => {
  // Interactive demo state
  const [value, setValue] = useState<FeedbackValue>(null);
  const [disabled, setDisabled] = useState(false);

  return (
    <ComponentViewLayout
      title="Feedback"
      description="Used to give feedback on AI responses."
    >
      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Value"
                options={['none', 'up', 'down'] as const}
                value={value === null ? 'none' : value}
                onChange={(val) => setValue(val === 'none' ? null : val as 'up' | 'down')}
              />

              <div></div>

              <FormCheckbox
                id="disabled"
                label="Disabled"
                checked={disabled}
                onCheckedChange={setDisabled}
              />
            </div>
          }
        >
          <Feedback
            value={value}
            onChange={setValue}
            disabled={disabled}
          />
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Default State */}
            <div>
              <h3 className="mb-2">Default</h3>
              <p className="mb-3">Both thumbs up and thumbs down buttons are visible when no selection is made.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="">
                  <Feedback value={null} />
                </div>
              </div>
            </div>

            {/* Thumbs Up Selected */}
            <div>
              <h3 className="mb-2">Thumbs up selected</h3>
              <p className="mb-3">When thumbs up is selected, thumbs down button disappears.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="">
                  <Feedback value="up" />
                </div>
              </div>
            </div>

            {/* Thumbs Down Selected */}
            <div>
              <h3 className="mb-2">Thumbs down selected</h3>
              <p className="mb-3">When thumbs down is selected, thumbs up button disappears.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="">
                  <Feedback value="down" />
                </div>
              </div>
            </div>

            {/* Disabled State */}
            <div>
              <h3 className="mb-2">Disabled</h3>
              <p className="mb-3">Feedback component in disabled state.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="">
                  <Feedback disabled />
                </div>
              </div>
            </div>

            {/* In context with AI Message */}
            <div>
              <h3 className="mb-2">In context</h3>
              <p className="mb-3">Example showing Feedback component after an AI message response.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="w-[400px] mx-auto">
                  <Message
                    variant="ai"
                    defaultText="Based on recent data, implementing seat assignments can increase team productivity by up to 45% and improve user engagement significantly."
                  />
                  <div className="mt-vca-s">
                    <Feedback value={null} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default FeedbackComponentView;

