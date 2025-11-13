import { useState } from 'react';
import { InfoMessage } from '@/components/vca-components/info-message';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const InfoMessageComponentView = () => {
  // Interactive demo state
  const [type, setType] = useState<'default' | 'response-stopped'>('default');
  const [title, setTitle] = useState("Here's what you need to know");
  const [message, setMessage] = useState('Based on your organization\'s usage patterns, we recommend enabling seat auto-assignment for new users.');
  const [showTitle, setShowTitle] = useState(true);
  const [showDivider, setShowDivider] = useState(true);
  const [showResponseStopped, setShowResponseStopped] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showRating, setShowRating] = useState(true);

  return (
    <div className="pt-16">
      <h1 className="mb-4">Info Message</h1>
      <p className="text-base text-gray-500 mb-12">Display rich message with context and link to sources.</p>
      
      {/* Demo Section */}
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
                  id="showDivider"
                  label="Show divider"
                  checked={showDivider}
                  onCheckedChange={setShowDivider}
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
            showDivider={showDivider}
            showResponseStopped={showResponseStopped}
            showSources={showSources}
            showRating={showRating}
            sources={showSources ? [
              { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', state: 'enabled' },
              { text: 'License Management Documentation', href: 'https://example.com/docs', state: 'enabled' },
            ] : undefined}
            onThumbsUp={() => alert('Thumbs up!')}
            onThumbsDown={() => alert('Thumbs down!')}
          />
        </div>
      </DemoSection>

      {/* Usage Section */}
      <div className="mt-16">
        <h2 className="mb-8">Usage</h2>
        
        <div className="space-y-12">
          {/* Full example */}
          <div>
            <h3 className="mb-4">Full example</h3>
            <p className="text-md text-gray-900 mb-3">Use AI information messages to provide information to the user along with clickable links to sources.</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="w-[352px] mx-auto">
                <InfoMessage 
                  type="default"
                  title="Here's what you need to know"
                  message="Based on your organization's usage patterns, we recommend enabling seat auto-assignment for new users. This will streamline onboarding and ensure consistent access to premium features."
                  showTitle={true}
                  showDivider={true}
                  showResponseStopped={false}
                  showSources={true}
                  showRating={true}
                  sources={[
                    { text: 'Onboarding Best Practices Guide', href: 'https://example.com/guide', state: 'enabled' },
                    { text: 'License Management Documentation', href: 'https://example.com/docs', state: 'enabled' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoMessageComponentView;

