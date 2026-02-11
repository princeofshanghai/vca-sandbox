import { useState } from 'react';
import { RecommendationCard } from '@/components/vca-components/recommendation-card';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea } from '@/components/component-library/DemoControls';

const RecommendationCardComponentView = () => {
  // Interactive demo state
  const [status, setStatus] = useState<'default' | 'applied' | 'dismissed'>('default');
  const [title, setTitle] = useState('Add seat assignments');
  const [impactText, setImpactText] = useState('+25% engagement');
  const [description, setDescription] = useState('Assign seats to all pending users in your organization. This will improve team collaboration and product adoption.');

  return (
    <ComponentViewLayout
      title="Recommendation Card"
      description="AI-powered suggestions that prompt users to take specific actions based on insights."
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

              {/* Spacer for grid consistency */}
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
                label="Impact text (optional)"
                value={impactText}
                onChange={(e) => setImpactText(e.target.value)}
                placeholder="e.g. High impact"
              />

              <FormTextarea
                id="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                rows={2}
                className="col-span-2"
              />
            </div>
          }
        >
          <div className="w-full max-w-md mx-auto">
            <RecommendationCard
              status={status}
              title={title}
              impactText={impactText}
              onApply={() => setStatus('applied')}
              onDismiss={() => setStatus('dismissed')}
            >
              {description}
            </RecommendationCard>
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
                <RecommendationCard
                  status="default"
                  title="Your campaign is underperforming"
                  impactText="impact"
                >
                  'Campaign A' is currently trailing behind competitors with 2.9% fewer impressions among your target audience.
                </RecommendationCard>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ComponentViewLayout >
  );
};

export default RecommendationCardComponentView;

