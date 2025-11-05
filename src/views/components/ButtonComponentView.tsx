import { Button } from '@/components/vca-components/buttons';

const ButtonComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Button</h1>
      <p className="text-md text-gray-500 mb-12">Interactive buttons with multiple variants, states, and optional icons.</p>
      
      <div className="space-y-12">
        {/* Primary Buttons */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Primary (Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Primary (Low Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Secondary (Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Secondary (Low Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Tertiary (Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Tertiary (Low Emphasis)</h2>
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Disabled States</h2>
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

