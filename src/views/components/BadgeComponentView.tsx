import { useState } from 'react';
import { Badge } from '@/components/vca-components/badge';
import type { BadgeState } from '@/components/vca-components/badge/Badge';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons } from '@/components/component-library/DemoControls';

const BadgeComponentView = () => {
  // Interactive demo state
  const [state, setState] = useState<BadgeState>('online');

  return (
    <div className="pt-16">
      <h1 className="mb-4">Badge</h1>
      <p className="text-base text-gray-500 mb-12">Used to show active status of a human agent.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="State"
              options={['online', 'offline'] as const}
              value={state}
              onChange={setState}
            />
          </div>
        }
      >
        <Badge state={state} />
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* States */}
        <div>
          <h3 className="text-lg font-medium mb-2">States</h3>
          <p className="text-md text-gray-900 mb-3">Two status states for user availability.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Badge state="online" />
                <span className="text-sm text-gray-700">Online (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge state="offline" />
                <span className="text-sm text-gray-700">Offline (Unavailable)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes Reference */}
        <div>
          <h3 className="text-lg font-medium mb-2">Size reference</h3>
          <p className="text-md text-gray-900 mb-3">Badge is 8px × 8px (fixed size).</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <Badge state="online" />
              <span className="text-xs text-gray-500">8px × 8px</span>
            </div>
          </div>
        </div>

        {/* Usage with Avatar */}
        <div>
          <h3 className="text-lg font-medium mb-2">Usage example</h3>
          <p className="text-md text-gray-900 mb-3">Badge is typically used with the Avatar component to show status.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-2">
              <p>The Badge component is automatically integrated into the Avatar component.</p>
              <p>See the <span className="font-medium">Avatar component</span> for usage examples with status badges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeComponentView;

