import { useState } from 'react';
import { Button } from '@/components/vca-components/buttons';
import { DemoSection } from '@/components/component-library/DemoSection';

const ButtonComponentView = () => {
  // Interactive demo state
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [emphasis, setEmphasis] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState<'start' | 'end'>('end');

  return (
    <div className="pt-16">
      <h1 className="mb-2">Button</h1>
      <p className="text-md text-gray-500 mb-12">Interactive buttons with multiple variants, states, and optional icons.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Variant */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Variant</label>
              <div className="flex gap-2">
                {['primary', 'secondary', 'tertiary'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      variant === v
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Position - Always visible but disabled when Show Icon is off */}
            <div className={!showIcon ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-2">Icon Position</label>
              <div className="flex gap-2">
                {['start', 'end'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setIconPosition(pos as any)}
                    disabled={!showIcon}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      iconPosition === pos
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Emphasis */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emphasis}
                  onChange={(e) => setEmphasis(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-xs font-medium text-gray-700">High Emphasis</span>
              </label>
            </div>

            {/* Disabled */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(e) => setDisabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-xs font-medium text-gray-700">Disabled</span>
              </label>
            </div>

            {/* Icon */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIcon}
                  onChange={(e) => setShowIcon(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-xs font-medium text-gray-700">Show Icon</span>
              </label>
            </div>
          </div>
        }
      >
        <Button
          variant={variant}
          emphasis={emphasis}
          disabled={disabled}
          icon={showIcon ? 'send' : undefined}
          iconPosition={iconPosition}
          onClick={() => alert('Button clicked!')}
        >
          Button
        </Button>
      </DemoSection>

      <div className="space-y-12">
        {/* Primary Buttons */}
        <div>
          <h2 className="mb-4">Primary (Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">High-emphasis primary action buttons with blue background.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" emphasis={true}>Button</Button>
              <Button variant="primary" emphasis={true} icon="send" iconPosition="start">Button</Button>
              <Button variant="primary" emphasis={true} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4">Primary (Low Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">Primary buttons with dark overlay background.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" emphasis={false}>Button</Button>
              <Button variant="primary" emphasis={false} icon="send" iconPosition="start">Button</Button>
              <Button variant="primary" emphasis={false} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div>
          <h2 className="mb-4">Secondary (Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">Outlined buttons with blue border and text.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" emphasis={true}>Button</Button>
              <Button variant="secondary" emphasis={true} icon="send" iconPosition="start">Button</Button>
              <Button variant="secondary" emphasis={true} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4">Secondary (Low Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">Outlined buttons with neutral border and text.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" emphasis={false}>Button</Button>
              <Button variant="secondary" emphasis={false} icon="send" iconPosition="start">Button</Button>
              <Button variant="secondary" emphasis={false} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        {/* Tertiary Buttons */}
        <div>
          <h2 className="mb-4">Tertiary (Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">Text-only buttons with blue text and transparent background.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="tertiary" emphasis={true}>Button</Button>
              <Button variant="tertiary" emphasis={true} icon="send" iconPosition="start">Button</Button>
              <Button variant="tertiary" emphasis={true} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4">Tertiary (Low Emphasis)</h2>
          <p className="text-sm text-gray-500 mb-3">Text-only buttons with neutral text and transparent background.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="tertiary" emphasis={false}>Button</Button>
              <Button variant="tertiary" emphasis={false} icon="send" iconPosition="start">Button</Button>
              <Button variant="tertiary" emphasis={false} icon="send" iconPosition="end">Button</Button>
            </div>
          </div>
        </div>

        {/* Disabled States */}
        <div>
          <h2 className="mb-4">Disabled States</h2>
          <p className="text-sm text-gray-500 mb-3">Non-interactive disabled state for all button variants.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" disabled>Button</Button>
              <Button variant="primary" disabled icon="send" iconPosition="end">Button</Button>
              <Button variant="secondary" disabled>Button</Button>
              <Button variant="secondary" disabled icon="send" iconPosition="start">Button</Button>
              <Button variant="tertiary" disabled>Button</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonComponentView;

