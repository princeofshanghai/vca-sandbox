import { InformationMessage } from '@/components/vca-components/information-message';

const InformationMessageComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Information Message</h1>
      <p className="text-md text-gray-500 mb-12">Informational message card with optional title, divider, sources, and rating for additional context.</p>
      
      <div className="space-y-12">
        {/* Full Example */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Full Example</h2>
          <p className="text-sm text-gray-500 mb-3">Complete information message with all features enabled.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
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

        {/* Without Title */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Without Title</h2>
          <p className="text-sm text-gray-500 mb-3">Information message without optional title.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="default"
                message="This is important information that doesn't require a title. It provides context or additional details about the conversation."
                showTitle={false}
                showDivider={true}
                showSources={true}
                showRating={true}
                sources={[
                  { text: 'Related Article', href: 'https://example.com/article', state: 'enabled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Without Divider */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Without Divider</h2>
          <p className="text-sm text-gray-500 mb-3">Information message without divider line.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="default"
                title="Quick Tip"
                message="You can customize your notification preferences in Settings to stay updated on important changes."
                showTitle={true}
                showDivider={false}
                showSources={false}
                showRating={true}
              />
            </div>
          </div>
        </div>

        {/* Response Stopped State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Response Stopped</h2>
          <p className="text-sm text-gray-500 mb-3">Simplified variant showing that response generation was stopped.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="response-stopped"
              />
            </div>
          </div>
        </div>

        {/* With Response Stopped Feedback (Default Type) */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">With Response Stopped Feedback</h2>
          <p className="text-sm text-gray-500 mb-3">Default type with response stopped feedback included.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="default"
                title="Incomplete Response"
                message="The response was interrupted before completion. Here's the partial information that was generated."
                showTitle={true}
                showDivider={true}
                showResponseStopped={true}
                showSources={false}
                showRating={true}
              />
            </div>
          </div>
        </div>

        {/* Without Rating */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Without Rating</h2>
          <p className="text-sm text-gray-500 mb-3">Information message without thumbs up/down rating buttons.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="default"
                title="System Notification"
                message="Your organization's license renewal is coming up next month. Contact your admin for details."
                showTitle={true}
                showDivider={true}
                showSources={false}
                showRating={false}
              />
            </div>
          </div>
        </div>

        {/* Without Sources */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Without Sources</h2>
          <p className="text-sm text-gray-500 mb-3">Information message without source citations.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <InformationMessage 
                type="default"
                title="Did you know?"
                message="You can use keyboard shortcuts to navigate faster. Press ? to see all available shortcuts."
                showTitle={true}
                showDivider={true}
                showSources={false}
                showRating={true}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">Purpose:</span> Display supplementary information, tips, notifications, or context in chat conversations.</p>
              <p><span className="font-medium">Light Blue Background:</span> Uses #f6fbff to distinguish from regular messages.</p>
              <p><span className="font-medium">Two Types:</span> "default" (full-featured) and "response-stopped" (simplified).</p>
              <p><span className="font-medium">Modular Features:</span> All elements (title, divider, sources, rating) are optional and can be toggled.</p>
              <p><span className="font-medium">No Fixed Width:</span> Adapts to parent container width (no double padding issue).</p>
              <p><span className="font-medium">Rating Buttons:</span> Uses ButtonIcon (thumbs up/down) for user feedback.</p>
              <p><span className="font-medium">Sources Integration:</span> Seamlessly integrates Sources component for citations.</p>
              <p><span className="font-medium">Corner Radius:</span> Asymmetric rounded corners matching LinkedIn VCA style.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationMessageComponentView;

