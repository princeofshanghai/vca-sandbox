import { useState } from 'react';
import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons } from '@/components/component-library/DemoControls';

const IconsComponentView = () => {
  // Interactive demo state
  const [selectedIcon, setSelectedIcon] = useState<VcaIconName>('send');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');

  // All available icons
  const icons: VcaIconName[] = [
    'arrow-left',
    'arrow-down', 
    'arrow-up',
    'check',
    'chevron-down',
    'close',
    'linkedin-bug',
    'send',
    'signal-ai',
    'signal-error',
    'signal-notice',
    'signal-success',
    'thumbs-down-fill',
    'thumbs-down-outline',
    'thumbs-up-fill',
    'thumbs-up-outline',
    'attachment',
    'undo',
    'document',
    'trash',
    'download',
    'messages',
    'placeholder',
  ];

  return (
    <div className="pt-16">
      <h1 className="mb-4">Icons</h1>
      <p className="text-base text-gray-500 mb-12">Custom LinkedIn SVG icons used throughout the VCA chatbot interface.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Size"
              options={['sm', 'md', 'lg'] as const}
              value={size}
              onChange={setSize}
            />

            <div></div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Select Icon
              </label>
              <select 
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value as VcaIconName)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {icons.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>
        }
      >
        <VcaIcon icon={selectedIcon} size={size} className="text-vca-icon" />
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* All icons Grid */}
        <div>
          <h3 className="text-lg font-medium mb-2">All icons</h3>
          <p className="text-md text-gray-900 mb-3">Complete set of 23 VCA icons.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-4 gap-6">
              {icons.map((iconName) => (
                <div key={iconName} className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <VcaIcon icon={iconName} size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-600 text-center">{iconName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="text-lg font-medium mb-2">Sizes</h3>
          <p className="text-md text-gray-900 mb-3">Icons available in three sizes.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="sm" className="text-vca-icon" />
                <span className="text-xs text-gray-500">Small (16px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="md" className="text-vca-icon" />
                <span className="text-xs text-gray-500">Medium (24px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="lg" className="text-vca-icon" />
                <span className="text-xs text-gray-500">Large (32px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-medium mb-2">By category</h3>
          <p className="text-md text-gray-900 mb-3">Icons organized by usage type.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Navigation */}
            <div>
              <p className="text-sm font-semibold mb-2">Navigation</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-left" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">arrow-left</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-up" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">arrow-up</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-down" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">arrow-down</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="chevron-down" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">chevron-down</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="close" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">close</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-sm font-semibold mb-2">Actions</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="send" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">send</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="attachment" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">attachment</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="check" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">check</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="undo" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">undo</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="trash" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">trash</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="download" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">download</span>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div>
              <p className="text-sm font-semibold mb-2">Signals & Status</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-ai" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">signal-ai</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-success" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">signal-success</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-error" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">signal-error</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-notice" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">signal-notice</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p className="text-sm font-semibold mb-2">Feedback</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-up-outline" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">thumbs-up-outline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-up-fill" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">thumbs-up-fill</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-down-outline" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">thumbs-down-outline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-down-fill" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">thumbs-down-fill</span>
                </div>
              </div>
            </div>

            {/* Other */}
            <div>
              <p className="text-sm font-semibold mb-2">Other</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="linkedin-bug" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">linkedin-bug</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="document" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">document</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="messages" size="md" className="text-vca-icon" />
                  <span className="text-xs text-gray-500">messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconsComponentView;

