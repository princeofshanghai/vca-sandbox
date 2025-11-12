import { useState } from 'react';
import { ButtonIcon } from '@/components/vca-components/buttons';
import { Header } from '@/components/vca-components/header';
import { Composer } from '@/components/vca-components/composer';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const ButtonIconComponentView = () => {
  // Interactive demo state
  const [type, setType] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [size, setSize] = useState<'sm' | 'md'>('md');
  const [emphasis, setEmphasis] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="pt-16">
      <h1 className="mb-2">Button Icon</h1>
      <p className="text-md text-gray-500 mb-12">Circular icon-only buttons for compact actions without text labels.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Type"
              options={['primary', 'secondary', 'tertiary'] as const}
              value={type}
              onChange={setType}
            />

            <ToggleButtons
              label="Size"
              options={['sm', 'md'] as const}
              value={size}
              onChange={setSize}
            />

            <FormCheckbox
              id="emphasis"
              label="High Emphasis"
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
          type={type}
          size={size}
          emphasis={emphasis}
          disabled={disabled}
          icon="placeholder"
          onClick={() => alert('Button icon clicked!')}
        />
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* In Header */}
        <div>
          <h3 className="text-base font-medium mb-2">In header</h3>
          <p className="text-sm text-gray-500 mb-4">Tertiary low-emphasis icon buttons are used for navigation and actions like back, minimize, and close in the header.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                showBack={true}
                showPremiumIcon={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* In Composer */}
        <div>
          <h3 className="text-base font-medium mb-2">In composer</h3>
          <p className="text-sm text-gray-500 mb-4">Icon buttons are used for attachment and send actions within the message composer input.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer 
                state="active"
                value="How can I help you today?"
                attachment={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonIconComponentView;

