import { useState } from 'react';
import { ActionMessage } from '@/components/vca-components/action-message';
import type { ActionMessageState } from '@/components/vca-components/action-message/ActionMessage';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const ActionMessageComponentView = () => {
  // Interactive demo state
  const [status, setStatus] = useState<ActionMessageState>('default');
  const [title, setTitle] = useState('Add seat assignments');
  const [impactText, setImpactText] = useState('+25% engagement');
  const [showImpact, setShowImpact] = useState(true);
  const [description, setDescription] = useState('Assign seats to all pending users in your organization. This will improve team collaboration and product adoption.');

  return (
    <ComponentViewLayout
      title="Action Message"
      description="Provides recommended actions for the user to take."
    >
      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Status"
                options={['default', 'applied', 'dismissed'] as const}
                value={status}
                onChange={setStatus}
              />

              <div></div>

              <FormInput
                id="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />

              <FormInput
                id="impactText"
                label="Impact text"
                value={impactText}
                onChange={(e) => setImpactText(e.target.value)}
                placeholder="Enter impact..."
              />

              <FormCheckbox
                id="showImpact"
                label="Show impact"
                checked={showImpact}
                onCheckedChange={setShowImpact}
              />

              <FormTextarea
                id="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                rows={3}
                className="col-span-2"
              />
            </div>
          }
        >
          <div className="w-[352px] mx-auto">
            <ActionMessage
              status={status}
              title={title}
              impactText={showImpact ? impactText : undefined}
              onApply={() => alert('Apply clicked!')}
              onDismiss={() => alert('Dismiss clicked!')}
            >
              {description}
            </ActionMessage>
          </div>
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">

          </div>

          {/* Custom content Example */}
          <div>
            <h3 className="mb-2">With impact</h3>
            <p className="mb-3">Recommendation with impact metric displayed to show expected benefit.</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="w-[352px] mx-auto">
                <ActionMessage
                  status="default"
                  title="Your campaign is underperforming"
                  impactText={undefined}
                >
                  'Campaign A' is currently trailing behind competitors with 2.9% fewer impressions among your target audience.
                </ActionMessage>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ComponentViewLayout >
  );
};

export default ActionMessageComponentView;

