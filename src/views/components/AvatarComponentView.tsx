import { useState } from 'react';
import { Avatar } from '@/components/vca-components/avatar';
import { Message } from '@/components/vca-components/messages';
import type { AvatarSize } from '@/components/vca-components/avatar/Avatar';
import type { BadgeState } from '@/components/vca-components/badge/Badge';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const AvatarComponentView = () => {
  // Interactive demo state
  const [size, setSize] = useState<AvatarSize>(24);
  const [showBadge, setShowBadge] = useState(true);
  const [badgeState, setBadgeState] = useState<BadgeState>('online');

  return (
    <ComponentViewLayout
      title="Avatar"
      description="Used to display picture of live agent with optional status badge."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Size"
                options={['20', '24', '32'] as const}
                value={String(size)}
                onChange={(val) => setSize(Number(val) as AvatarSize)}
              />

              <ToggleButtons
                label="Badge state"
                options={['online', 'offline'] as const}
                value={badgeState}
                onChange={setBadgeState}
                disabled={!showBadge}
              />

              <FormCheckbox
                id="showBadge"
                label="Show badge"
                checked={showBadge}
                onCheckedChange={setShowBadge}
              />
            </div>
          }
        >
          <Avatar
            size={size}
            showBadge={showBadge}
            badgeState={badgeState}
          />
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Agent Message */}
            <div>
              <h3 className="mb-2">Agent message</h3>
              <p className="mb-4">Used to show that message is written by a human agent.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <Message variant="human-agent" humanAgentText="Hi there! I'm here to help you with any questions you have about your account." />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </ComponentViewLayout >
  );
};

export default AvatarComponentView;

