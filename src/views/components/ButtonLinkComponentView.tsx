import { useState } from 'react';
import { ButtonLink } from '@/components/vca-components/buttons';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonLinkComponentView = () => {
  // Interactive demo state
  const [text, setText] = useState('View details');
  const [disabled, setDisabled] = useState(false);
  const [hasHref, setHasHref] = useState(false);

  return (
    <div className="pt-16">
      <h1 className="mb-2">Button Link</h1>
      <p className="text-md text-gray-500 mb-12">Text-only link buttons for inline actions without visual weight.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormInput
              id="text"
              label="Link Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
            />

            <div></div>

            <FormCheckbox
              id="disabled"
              label="Disabled"
              checked={disabled}
              onCheckedChange={setDisabled}
            />

            <FormCheckbox
              id="hasHref"
              label="External Link (href)"
              checked={hasHref}
              onCheckedChange={setHasHref}
            />
          </div>
        }
      >
        <ButtonLink 
          disabled={disabled}
          href={hasHref ? 'https://linkedin.com' : undefined}
          onClick={() => !hasHref && alert('Link clicked!')}
        >
          {text}
        </ButtonLink>
      </DemoSection>

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

