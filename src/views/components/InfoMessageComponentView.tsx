import { useState } from 'react';
import { InfoMessage } from '@/components/vca-components/info-message';
import { FeedbackValue } from '@/components/vca-components/feedback';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const InfoMessageComponentView = () => {
  // Interactive demo state
  const [type, setType] = useState<'default' | 'response-stopped'>('default');
  const [title, setTitle] = useState("Here's what you need to know");
  const [message, setMessage] = useState('Based on your organization\'s usage patterns, we recommend enabling seat auto-assignment for new users.');
  const [showTitle, setShowTitle] = useState(true);
  const [showResponseStopped, setShowResponseStopped] = useState(false);
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
              <ToggleButtons
                label="Type"
                options={['default', 'response-stopped'] as const}
                value={type}
                onChange={setType}
              />

              <div></div>

              {type === 'default' && (
                <>
                  <FormInput
                    id="title"
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="col-span-2"
                  />

                  <FormTextarea
                    id="message"
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message..."
                    rows={3}
                    className="col-span-2"
                  />

                  <FormCheckbox
                    id="showTitle"
                    label="Show title"
                    checked={showTitle}
                    onCheckedChange={setShowTitle}
                  />

                  <FormCheckbox
                    id="showResponseStopped"
                    label="Show response stopped"
                    checked={showResponseStopped}
                    onCheckedChange={setShowResponseStopped}
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
              )}
            </div>
          }
        >
          <div className="w-[352px] mx-auto">
            <InfoMessage
              type={type}
              title={title}
              message={message}
              showTitle={showTitle}
              showResponseStopped={showResponseStopped}
              showSources={showSources}
              showRating={showRating}
              sources={showSources ? [
                { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', state: 'enabled' },
                { text: 'License Management Documentation', href: 'https://example.com/docs', state: 'enabled' },
              ] : undefined}
              feedbackValue={feedbackValue}
              onFeedbackChange={setFeedbackValue}
            />
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
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <InfoMessage
                    type="default"
                    title="Here's what you need to know"
                    message="Based on your organization's usage patterns, we recommend enabling seat auto-assignment for new users. This will streamline onboarding and ensure consistent access to premium features."
                    showTitle={true}
                    showResponseStopped={false}
                    showSources={true}
                    showRating={true}
                    sources={[
                      { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', state: 'enabled' },
                      { text: 'License Management Documentation', href: 'https://example.com/docs', state: 'enabled' },
                    ]}
                    feedbackValue={null}
                    onFeedbackChange={(value) => console.log('Feedback:', value)}
                  />
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

