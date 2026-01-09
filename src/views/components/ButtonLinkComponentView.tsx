import { useState } from 'react';
import { ButtonLink } from '@/components/vca-components/buttons';
import { AgentStatus } from '@/components/vca-components/agent-status';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonLinkComponentView = () => {
  // Interactive demo state
  const [text, setText] = useState('View details');
  const [disabled, setDisabled] = useState(false);
  const [hasHref, setHasHref] = useState(false);

  return (
    <ComponentViewLayout
      title="Button Link"
      description="Used for inline actions that need to be aligned with text."
    >

      {/* Demo Section */}
      <div className="space-y-20">
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
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* In Human Agent Status */}
            <div>
              <h3 className="mb-2">Agent status</h3>
              <p className="mb-3">Used for secondary actions where button needs to be aligned with text, like ending a live chat session.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <AgentStatus
                    state="connecting"
                    showDescription={true}
                    showAction={true}
                    onAction={() => alert('Cancel clicked!')}
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

export default ButtonLinkComponentView;

