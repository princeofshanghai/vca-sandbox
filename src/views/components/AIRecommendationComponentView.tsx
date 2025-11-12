import { useState } from 'react';
import { AIRecommendation } from '@/components/vca-components/ai-recommendation';
import type { AIRecommendationState } from '@/components/vca-components/ai-recommendation/AIRecommendation';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea } from '@/components/component-library/DemoControls';

const AIRecommendationComponentView = () => {
  // Interactive demo state
  const [state, setState] = useState<AIRecommendationState>('default');
  const [title, setTitle] = useState('Add seat assignments');
  const [impactText, setImpactText] = useState('+25% engagement');
  const [description, setDescription] = useState('Assign seats to all pending users in your organization. This will improve team collaboration and product adoption.');

  return (
    <div className="pt-16">
      <h1 className="mb-2">AI Recommendation</h1>
      <p className="text-md text-gray-500 mb-12">AI-powered action suggestions with impact indicators and state management.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="State"
              options={['default', 'applied', 'dismissed'] as const}
              value={state}
              onChange={setState}
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
              label="Impact Text"
              value={impactText}
              onChange={(e) => setImpactText(e.target.value)}
              placeholder="Enter impact..."
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
          <AIRecommendation 
            state={state}
            title={title}
            impactText={impactText}
            description={description}
            onApply={() => alert('Apply clicked!')}
            onDismiss={() => alert('Dismiss clicked!')}
          />
        </div>
      </DemoSection>

      <div className="space-y-12">
        {/* Default State */}
        <div>
          <h2 className="mb-4">Default</h2>
          <p className="text-sm text-gray-500 mb-3">Initial state with Apply and Dismiss action buttons.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <AIRecommendation 
                state="default"
                title="Recommended action"
                impactText="impact"
                description="This is a recommendation description that explains the action and its expected impact."
              />
            </div>
          </div>
        </div>

        {/* Applied State */}
        <div>
          <h2 className="mb-4">Applied</h2>
          <p className="text-sm text-gray-500 mb-3">Success state after user applies the recommendation.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <AIRecommendation 
                state="applied"
                title="Recommended action"
                impactText="impact"
                description="This recommendation has been applied successfully."
              />
            </div>
          </div>
        </div>

        {/* Dismissed State */}
        <div>
          <h2 className="mb-4">Dismissed</h2>
          <p className="text-sm text-gray-500 mb-3">Neutral state after user dismisses the recommendation.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <AIRecommendation 
                state="dismissed"
                title="Recommended action"
                impactText="impact"
                description="This recommendation has been dismissed."
              />
            </div>
          </div>
        </div>

        {/* Custom Content Example */}
        <div>
          <h2 className="mb-4">Custom Content</h2>
          <p className="text-sm text-gray-500 mb-3">Recommendation with customized title, impact, and description.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <AIRecommendation 
                state="default"
                title="Add seat assignments"
                impactText="+25% engagement"
                description="Assign seats to all pending users in your organization. This will improve team collaboration and product adoption."
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">State Management:</span> Component has three states: default (with buttons), applied (success feedback), and dismissed (neutral feedback).</p>
              <p><span className="font-medium">No Built-in Spacing:</span> Component has no horizontal padding or fixed width - parent container controls all spacing.</p>
              <p><span className="font-medium">Impact Highlight:</span> The impactText appears in green to emphasize positive outcomes.</p>
              <p><span className="font-medium">Surface Color:</span> Uses vca-surface-tint (light blue background) to distinguish from regular messages.</p>
              <p><span className="font-medium">Corner Radius:</span> Asymmetric rounded corners (bottom-left is smaller) per LinkedIn VCA design.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationComponentView;

