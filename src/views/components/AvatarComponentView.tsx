import { useState } from 'react';
import { Avatar } from '@/components/vca-components/avatar';
import { Message } from '@/components/vca-components/messages';
import type { AvatarFallbackStyle, AvatarFallbackTone, AvatarSize } from '@/components/vca-components/avatar/Avatar';
import type { BadgeState } from '@/components/vca-components/badge/Badge';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const silhouetteTones: AvatarFallbackTone[] = ['amber', 'rose', 'green', 'blue', 'taupe'];

const AvatarComponentView = () => {
  // Interactive demo state
  const [size, setSize] = useState<AvatarSize>(24);
  const [showBadge, setShowBadge] = useState(true);
  const [badgeState, setBadgeState] = useState<BadgeState>('online');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [fallbackStyle, setFallbackStyle] = useState<AvatarFallbackStyle>('silhouette');
  const [fallbackTone, setFallbackTone] = useState<AvatarFallbackTone>('blue');

  return (
    <ComponentViewLayout
      title="Avatar"
      description="Used to display people with optional status badge. Supports a no-photo silhouette fallback."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          demoContentClassName="flex-col gap-6"
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

              <FormCheckbox
                id="hasPhoto"
                label="Use photo source"
                checked={hasPhoto}
                onCheckedChange={setHasPhoto}
              />

              <ToggleButtons
                label="Fallback style"
                options={['silhouette', 'photo-default'] as const}
                value={fallbackStyle}
                onChange={setFallbackStyle}
              />

              <ToggleButtons
                label="Fallback tone"
                options={silhouetteTones}
                value={fallbackTone}
                onChange={setFallbackTone}
                disabled={fallbackStyle !== 'silhouette'}
              />
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4">
            <Avatar
              size={size}
              src={hasPhoto ? '/avatar.jpg' : undefined}
              showBadge={showBadge}
              badgeState={badgeState}
              fallbackStyle={fallbackStyle}
              fallbackTone={fallbackTone}
            />
            {!hasPhoto && fallbackStyle === 'silhouette' && (
              <div className="flex items-center gap-5">
                {silhouetteTones.map((tone) => (
                  <Avatar
                    key={tone}
                    size={32}
                    fallbackStyle="silhouette"
                    fallbackTone={tone}
                    alt={`${tone} fallback avatar`}
                  />
                ))}
              </div>
            )}
          </div>
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
              <div className="bg-shell-bg border border-shell-border rounded-lg p-4">
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
