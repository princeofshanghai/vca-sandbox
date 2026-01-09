import { useState } from 'react';
import { Button } from '@/components/vca-components/buttons';
import { ActionMessage } from '@/components/vca-components/action-message';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonComponentView = () => {
  // Interactive demo state
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [emphasis, setEmphasis] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState<'start' | 'end'>('end');

  return (
    <ComponentViewLayout
      title="Button"
      description="Buttons are used sparingly for message related actions in VCA."
    >
      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Variant"
                options={['primary', 'secondary', 'tertiary'] as const}
                value={variant}
                onChange={setVariant}
              />

              <ToggleButtons
                label="Icon position"
                options={['start', 'end'] as const}
                value={iconPosition}
                onChange={setIconPosition}
                disabled={!showIcon}
              />

              <FormCheckbox
                id="emphasis"
                label="High emphasis"
                checked={emphasis}
                onCheckedChange={setEmphasis}
              />

              <FormCheckbox
                id="disabled"
                label="Disabled"
                checked={disabled}
                onCheckedChange={setDisabled}
              />

              <FormCheckbox
                id="showIcon"
                label="Show icon"
                checked={showIcon}
                onCheckedChange={setShowIcon}
              />
            </div>
          }
        >
          <Button
            variant={variant}
            emphasis={emphasis}
            disabled={disabled}
            icon={showIcon ? 'placeholder' : undefined}
            iconPosition={iconPosition}
            onClick={() => alert('Button clicked!')}
          >
            Button
          </Button>
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Recommendations */}
            <div>
              <h3 className="mb-2">In recommendations</h3>
              <p className="mb-4">Used in recommendation cards to apply or dismiss AI suggestions.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <ActionMessage
                    state="default"
                    title="Add seat assignments"
                    impactText="+25% engagement"
                    showImpact={true}
                    description="Assign seats to all pending users in your organization. This will improve team collaboration and product adoption."
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

export default ButtonComponentView;

