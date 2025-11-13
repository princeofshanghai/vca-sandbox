import { useState } from 'react';
import { ButtonLink } from '@/components/vca-components/buttons';
import { AgentStatus } from '@/components/vca-components/agent-status';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonLinkComponentView = () => {
  // Interactive demo state
  const [text, setText] = useState('View details');
  const [disabled, setDisabled] = useState(false);
  const [hasHref, setHasHref] = useState(false);

  return (
    <div className="pt-16">
      <h1 className="mb-4">Button Link</h1>
      <p className="text-base text-gray-500 mb-12">Text-only buttons for inline actions without extra padding.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormInput
              id="text"
              label="Link text"
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
              label="External link (href)"
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

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* In Human Agent Status */}
        <div>
          <h3 className="text-lg font-medium mb-2">Agent status</h3>
          <p className="text-md text-gray-900 mb-3">Used for secondary actions where button needs to be aligned with text, like ending a live chat session.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <AgentStatus 
                state="connecting"
                statusLabel="Connecting with a member of our team"
                description="Our team is joining soon for live chat. AI will not be responding at this moment."
                actionLabel="Cancel"
                showDescription={true}
                showAction={true}
                onAction={() => alert('Cancel clicked!')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonLinkComponentView;

