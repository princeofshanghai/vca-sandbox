import { useState } from 'react';
import { Container } from '@/components/vca-components/container';
import { Message } from '@/components/vca-components/messages';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { FormInput, FormCheckbox, ToggleButtons } from '@/components/component-library/DemoControls';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { Badge } from '@/components/ui/badge';

const ContainerComponentView = () => {
  // Interactive demo state
  const [title, setTitle] = useState('Help');
  const [showBack, setShowBack] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [contentType, setContentType] = useState<'empty' | 'simple' | 'full'>('simple');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  const renderContent = () => {
    if (contentType === 'empty') {
      return null;
    }

    if (contentType === 'simple') {
      return (
        <div className="space-y-vca-lg">
          <Message
            variant="ai"
            defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
          />
        </div>
      );
    }

    // full
    return (
      <div className="space-y-vca-lg">
        <Message variant="disclaimer" />
        <Message
          variant="ai"
          defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
        />
        <Message
          variant="user"
          userText="How can I remove a user?"
          errorFeedback={false}
          className="flex justify-end"
        />
        <Message
          variant="ai"
          defaultText="To assign a seat to a user, you'll need admin permissions..."
        />
      </div>
    );
  };

  return (
    <ComponentViewLayout
      title="Container"
      description="Main chat container with header, content area, and composer."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="space-y-4">
              {/* Viewport Toggle - Full Width */}
              <div className="pb-4 border-b border-shell-border">
                <ToggleButtons
                  label="Viewport"
                  options={['desktop', 'mobile'] as const}
                  value={viewport}
                  onChange={setViewport}
                />
              </div>

              {/* Other Controls - Grid Layout */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <FormInput
                  id="title"
                  label="Title text"
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
                  label="Show back button"
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
                  label="Show action button"
                  checked={showAction}
                  onCheckedChange={setShowAction}
                />
              </div>
            </div>
          }
        >
          <div className="flex justify-center items-center py-8">
            {viewport === 'mobile' ? (
              // Mobile View - Always wrapped in Sheet Frame
              <PhoneFrame showStatusBar={true}>
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
              // Desktop - No frame, just container
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

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2 className="mb-8">Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Empty Container - Just the Shell */}
            <div>
              <h3 className="mb-2">Desktop</h3>
              <p className="mb-3">Header contains Help title and close button.</p>
              <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-6 flex justify-center">
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

            {/* Mobile Container */}
            <div>
              <h3 className="mb-2">Mobile</h3>
              <p className="mb-3">Mobile container appears as a sheet overlay with handle bar and close button.</p>
              <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-6 flex justify-center">
                <Container
                  headerTitle="Help"
                  viewport="mobile"
                  showHeaderBack={false}
                  showHeaderPremiumIcon={false}
                  showHeaderAction={false}
                >
                  {/* Empty - no content */}
                </Container>
              </div>
            </div>

            {/* With Simple Content */}

            {/* With Premium border */}
            <div>
              <h3 className="mb-2 flex items-center gap-2">
                Premium
                <Badge variant="wip">WIP</Badge>
              </h3>
              <p className="mb-3">LinkedIn premium bug and gold bottom border for premium users.</p>
              <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-6 flex justify-center">
                <Container
                  headerTitle="Help"
                  showHeaderBack={false}
                  showHeaderPremiumIcon={true}
                  showHeaderAction={false}
                  showPremiumBorder={true}
                >
                  <div className="space-y-vca-lg">
                    <Message
                      variant="ai"
                      defaultText="Welcome! How can I help you today?"
                    />
                  </div>
                </Container>
              </div>
            </div>

            {/* With back button */}
            <div>
              <h3 className="mb-2">From IPH</h3>
              <p className="mb-3">Header contains additional back button to go back to IPH.</p>
              <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-6 flex justify-center">
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

            {/* Full example */}
            <div>
              <h3 className="mb-2">Full example</h3>
              <p className="mb-3">Complete container with all features enabled and rich content.</p>
              <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-6 flex justify-center">
                <Container
                  headerTitle="Help"
                  showHeaderBack={true}
                  showHeaderPremiumIcon={true}
                  showHeaderAction={true}
                  showPremiumBorder={true}
                >
                  <div className="space-y-vca-xxl">
                    <Message variant="disclaimer" />
                    <Message
                      variant="ai"
                      defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can."
                    />
                    <Message
                      variant="ai"
                      defaultText="Not sure where to start? You can try:"
                    />
                    <Message
                      variant="user"
                      userText="How can I assign a seat to a user?"
                      errorFeedback={false}
                      className="flex justify-end"
                    />
                    <Message
                      variant="ai"
                      defaultText="To assign a seat to a user, you'll need admin permissions..."
                    />
                  </div>
                </Container>
              </div>
            </div>


          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default ContainerComponentView;

