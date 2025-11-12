import { useState } from 'react';
import { Container } from '@/components/vca-components/container';
import { Message } from '@/components/vca-components/messages';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormInput, FormCheckbox, ToggleButtons } from '@/components/component-library/DemoControls';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';

const ContainerComponentView = () => {
  // Interactive demo state
  const [title, setTitle] = useState('Help');
  const [showBack, setShowBack] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [contentType, setContentType] = useState<'empty' | 'simple' | 'full'>('simple');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [showPhoneFrame, setShowPhoneFrame] = useState(false);

  const renderContent = () => {
    if (contentType === 'empty') {
      return null;
    }
    
    if (contentType === 'simple') {
      return (
        <div className="px-vca-xxl space-y-vca-lg">
          <Message 
            type="ai" 
            defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
          />
        </div>
      );
    }
    
    // full
    return (
      <div className="px-vca-xxl space-y-vca-lg">
        <Message 
          type="ai" 
          defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
        />
        <Message 
          type="disclaimer"
        />
        <Message 
          type="user"
          userText="How can I remove a user?"
          errorFeedback={false}
          className="flex justify-end"
        />
        <Message 
          type="ai" 
          defaultText="To assign a seat to a user, you'll need admin permissions..."
        />
      </div>
    );
  };

  return (
    <div className="pt-16">
      <h1 className="mb-2">Container</h1>
      <p className="text-md text-gray-500 mb-12">Complete chatbot panel combining Header, scrollable content area, and Composer.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="space-y-4">
            {/* Viewport Toggle - Full Width */}
            <div className="pb-4 border-b border-gray-200">
              <ToggleButtons
                label="Viewport"
                options={['desktop', 'mobile'] as const}
                value={viewport}
                onChange={setViewport}
              />
              {viewport === 'mobile' && (
                <div className="mt-3">
                  <FormCheckbox
                    id="showPhoneFrame"
                    label="Show Phone Frame"
                    checked={showPhoneFrame}
                    onCheckedChange={setShowPhoneFrame}
                  />
                </div>
              )}
            </div>

            {/* Other Controls - Grid Layout */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <FormInput
                id="title"
                label="Title Text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />

              <ToggleButtons
                label="Content"
                options={['empty', 'simple', 'full'] as const}
                value={contentType}
                onChange={setContentType}
              />

              <FormCheckbox
                id="showBack"
                label="Show Back Button"
                checked={showBack}
                onCheckedChange={setShowBack}
              />

              <FormCheckbox
                id="isPremium"
                label="Premium (icon + border)"
                checked={isPremium}
                onCheckedChange={setIsPremium}
              />

              <FormCheckbox
                id="showAction"
                label="Show Action Button"
                checked={showAction}
                onCheckedChange={setShowAction}
              />
            </div>
          </div>
        }
      >
        <div className="flex justify-center">
          {showPhoneFrame && viewport === 'mobile' ? (
            // Phone frame mockup with status bar and dimmed background
            <PhoneFrame showStatusBar={true} dimBackground={true}>
              <Container 
                headerTitle={title}
                viewport={viewport}
                showHeaderBack={showBack}
                showHeaderPremiumIcon={isPremium}
                showHeaderAction={showAction}
                showPremiumBorder={isPremium}
              >
                {renderContent()}
              </Container>
            </PhoneFrame>
          ) : (
            // No frame - just container
            <Container 
              headerTitle={title}
              viewport={viewport}
              showHeaderBack={showBack}
              showHeaderPremiumIcon={isPremium}
              showHeaderAction={showAction}
              showPremiumBorder={isPremium}
            >
              {renderContent()}
            </Container>
          )}
        </div>
      </DemoSection>
      
      <div className="space-y-12">
        {/* Empty Container - Just the Shell */}
        <div>
          <h2 className="mb-4">Empty Container (Shell Only)</h2>
          <p className="text-sm text-gray-500 mb-3">The basic structure with no content - just Header + Content Area + Composer.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
            <Container 
              headerTitle="Help"
              showHeaderBack={false}
              showHeaderPremiumIcon={false}
              showHeaderAction={false}
            >
              {/* Empty - no content */}
            </Container>
          </div>
        </div>

        {/* With Simple Content */}
        <div>
          <h2 className="mb-4">With Content</h2>
          <p className="text-sm text-gray-500 mb-3">Container with some message content.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
            <Container 
              headerTitle="Help"
              showHeaderBack={false}
              showHeaderPremiumIcon={false}
              showHeaderAction={false}
            >
              <div className="px-vca-xxl space-y-vca-lg">
                <Message 
                  type="ai" 
                  defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
                />
                <Message 
                  type="disclaimer"
                />
                <Message 
                  type="user"
                  userText="How can I remove a user?"
                  errorFeedback={false}
                  className="flex justify-end"
                />
              </div>
            </Container>
          </div>
        </div>

        {/* With Premium Border */}
        <div>
          <h2 className="mb-4">Premium Border</h2>
          <p className="text-sm text-gray-500 mb-3">Container with gold premium border for premium users.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
            <Container 
              headerTitle="Help"
              showHeaderBack={false}
              showHeaderPremiumIcon={true}
              showHeaderAction={false}
              showPremiumBorder={true}
            >
              <div className="px-vca-xxl space-y-vca-lg">
                <Message 
                  type="ai" 
                  defaultText="Welcome! How can I help you today?"
                />
              </div>
            </Container>
          </div>
        </div>

        {/* With Back Button */}
        <div>
          <h2 className="mb-4">With Back Button</h2>
          <p className="text-sm text-gray-500 mb-3">Container with navigation back button in header.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
            <Container 
              headerTitle="Help"
              showHeaderBack={true}
              showHeaderPremiumIcon={false}
              showHeaderAction={false}
            >
              {/* Empty content */}
            </Container>
          </div>
        </div>

        {/* Full Example */}
        <div>
          <h2 className="mb-4">Full Example</h2>
          <p className="text-sm text-gray-500 mb-3">Complete container with all features enabled and rich content.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
            <Container 
              headerTitle="Help"
              showHeaderBack={true}
              showHeaderPremiumIcon={true}
              showHeaderAction={true}
              showPremiumBorder={true}
            >
              <div className="px-vca-xxl space-y-vca-xxl">
                <Message 
                  type="ai" 
                  defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
                />
                <Message 
                  type="disclaimer"
                />
                <Message 
                  type="ai" 
                  defaultText="Not sure where to start? You can try:"
                />
                <Message 
                  type="user"
                  userText="How can I assign a seat to a user?"
                  errorFeedback={false}
                  className="flex justify-end"
                />
                <Message 
                  type="ai" 
                  defaultText="To assign a seat to a user, you'll need admin permissions..."
                />
              </div>
            </Container>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Fixed Dimensions:</span> Container is 400px wide × 788px tall to match LinkedIn's VCA chatbot.</p>
              <p><span className="font-medium">Scrollable Content:</span> The middle content area scrolls when content exceeds available space.</p>
              <p><span className="font-medium">Fixed Header & Composer:</span> Header and Composer remain fixed at top and bottom.</p>
              <p><span className="font-medium">Content Alignment:</span> Content aligns to the bottom by default (justify-end) for chat-like behavior.</p>
              <p><span className="font-medium">Padding:</span> Add `px-vca-xxl` (24px) to content for proper side spacing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerComponentView;

