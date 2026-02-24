import { useState } from 'react';
import { ButtonIcon } from '@/components/vca-components/buttons';
import { Composer } from '@/components/vca-components/composer';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonIconComponentView = () => {
  // Interactive demo state
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [size, setSize] = useState<'sm' | 'md'>('md');
  const [emphasis, setEmphasis] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <ComponentViewLayout
      title="Button Icon"
      description="Button Icons are used primarily for actions in the VCA container."
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
                label="Size"
                options={['sm', 'md'] as const}
                value={size}
                onChange={setSize}
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
            </div>
          }
        >
          <ButtonIcon
            variant={variant}
            size={size}
            emphasis={emphasis}
            disabled={disabled}
            icon="placeholder"
            onClick={() => alert('Button icon clicked!')}
          />
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">




            {/* In Composer */}
            <div>
              <h3 className="mb-2">Composer</h3>
              <p className="mb-4">Used for attachment and send actions in the composer.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border border-shell-border rounded-lg overflow-hidden">
                  <Composer
                    status="active"
                    value="How can I help you today?"
                    attachment={true}
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

export default ButtonIconComponentView;

