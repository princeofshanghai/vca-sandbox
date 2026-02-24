import { useState } from 'react';
import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ToggleButtons } from '@/components/component-library/DemoControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    'external-link',
  ];

  return (
    <ComponentViewLayout
      title="Icons"
      description="Icons in VCA are a subset from the Mercado design system."
    >

      {/* Demo Section */}
      <div className="space-y-20">
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
                <label className="block text-xs font-medium text-shell-muted-strong mb-2">
                  Select Icon
                </label>
                <Select value={selectedIcon} onValueChange={(value) => setSelectedIcon(value as VcaIconName)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {icons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        >
          <VcaIcon icon={selectedIcon} size={size} className="text-vca-icon" />
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>All icons</h2>
          </div>

          <div className="space-y-12">
            {/* All icons Grid */}
            <div>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-6">
                <div className="grid grid-cols-4 gap-6">
                  {icons.map((iconName) => (
                    <div key={iconName} className="flex flex-col items-center gap-2 p-4 border border-shell-border rounded-lg hover:bg-shell-surface-subtle">
                      <VcaIcon icon={iconName} size="md" className="text-vca-icon" />
                      <span className="text-xs text-shell-muted text-center">{iconName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h2>Sizes</h2>
              <p className="mb-3">Icons in VCA are used in three sizes.</p>
              <div className="bg-shell-bg border border-shell-border rounded-lg p-6">
                <div className="flex items-end gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <VcaIcon icon="send" size="sm" className="text-vca-icon" />
                    <span className="text-xs text-shell-muted">Small (16px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <VcaIcon icon="send" size="md" className="text-vca-icon" />
                    <span className="text-xs text-shell-muted">Medium (24px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <VcaIcon icon="send" size="lg" className="text-vca-icon" />
                    <span className="text-xs text-shell-muted">Large (32px)</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default IconsComponentView;

