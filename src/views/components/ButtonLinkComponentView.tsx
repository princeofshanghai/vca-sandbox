import { ButtonLink } from '@/components/vca-components/buttons';

const ButtonLinkComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Button Link</h1>
      <p className="text-md text-gray-500 mb-12">Text-only link buttons for inline actions without visual weight.</p>
      
      <div className="space-y-12">
        {/* All States */}
        <div>
          <h2 className="mb-4">States</h2>
          <p className="text-sm text-gray-500 mb-3">Link buttons with different interaction states.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Enabled</p>
                <ButtonLink>View details</ButtonLink>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Hover (hover over the link)</p>
                <ButtonLink>Learn more</ButtonLink>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Active (click the link)</p>
                <ButtonLink>Continue</ButtonLink>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Disabled</p>
                <ButtonLink disabled>Not available</ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <h2 className="mb-4">Usage Examples</h2>
          <p className="text-sm text-gray-500 mb-3">Common use cases for link buttons in chat interfaces.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Inline in text</p>
                <p className="text-sm text-gray-700">
                  To learn more about our policies, <ButtonLink>click here</ButtonLink> or contact support.
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">As standalone action</p>
                <div className="space-y-2">
                  <ButtonLink>View full conversation</ButtonLink>
                  <br />
                  <ButtonLink>Download transcript</ButtonLink>
                  <br />
                  <ButtonLink>Share feedback</ButtonLink>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">With href (external link)</p>
                <ButtonLink href="https://linkedin.com">Visit LinkedIn</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonLinkComponentView;

