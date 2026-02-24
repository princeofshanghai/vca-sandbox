import { useState } from 'react';
import { InfoMessage } from '@/components/vca-components/info-message';
import { FeedbackValue } from '@/components/vca-components/feedback';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const InfoMessageComponentView = () => {
  // Interactive demo state
  // Interactive demo state
  // Interactive demo state
  const [children, setChildren] = useState('Based on your organization\'s usage patterns, we recommend enabling seat auto-assignment for new users.');
  const [status, setStatus] = useState<'complete' | 'interrupted'>('complete');
  const [showSources, setShowSources] = useState(true);
  const [showRating, setShowRating] = useState(true);
  const [feedbackValue, setFeedbackValue] = useState<FeedbackValue>(null);

  return (
    <ComponentViewLayout
      title="Info Message"
      description="Displays rich AI message with context with link to sources and option to give feedback."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div></div>

              <>


                <FormTextarea
                  id="message"
                  label="Message"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                  placeholder="Enter message..."
                  rows={3}
                  className="col-span-2"
                />

                <ToggleButtons
                  label="Status"
                  options={['complete', 'interrupted'] as const}
                  value={status}
                  onChange={setStatus}
                />

                <FormCheckbox
                  id="showSources"
                  label="Show sources"
                  checked={showSources}
                  onCheckedChange={setShowSources}
                />

                <FormCheckbox
                  id="showRating"
                  label="Show rating"
                  checked={showRating}
                  onCheckedChange={setShowRating}
                />

                <ToggleButtons
                  label="Feedback value"
                  options={['none', 'up', 'down'] as const}
                  value={feedbackValue === null ? 'none' : feedbackValue}
                  onChange={(val) => setFeedbackValue(val === 'none' ? null : val as 'up' | 'down')}
                />
              </>
            </div>
          }
        >
          <div className="w-[352px] mx-auto">
            <InfoMessage
              status={status}
              sources={showSources ? [
                { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', status: 'enabled' },
                { text: 'License Management Documentation', href: 'https://example.com/docs', status: 'enabled' },
              ] : undefined}
              feedbackValue={feedbackValue}
              onFeedbackChange={showRating ? setFeedbackValue : undefined}
            >
              {children}
            </InfoMessage>
          </div>
        </DemoSection>

        {/* Usage Section */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Full example */}
            <div>
              <h3 className="mb-4">Full example</h3>
              <p className="mb-3">Use AI information messages to provide information to the user along with clickable links to sources.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <InfoMessage
                    status="complete"
                    sources={[
                      { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', status: 'enabled' },
                      { text: 'License Management Documentation', href: 'https://example.com/docs', status: 'enabled' },
                    ]}
                    feedbackValue={null}
                    onFeedbackChange={(value) => console.log('Feedback:', value)}
                  >
                    Based on your organization's usage patterns, we recommend enabling seat auto-assignment for new users. This will streamline onboarding and ensure consistent access to premium features.
                  </InfoMessage>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default InfoMessageComponentView;

