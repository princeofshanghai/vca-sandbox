import { Recommendation } from '@/components/vca-components/recommendation';

const RecommendationComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Recommendation</h1>
      <p className="text-md text-gray-500 mb-12">AI-powered action suggestions with impact indicators and state management.</p>
      
      <div className="space-y-12">
        {/* Default State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Default</h2>
          <p className="text-sm text-gray-500 mb-3">Initial state with Apply and Dismiss action buttons.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Recommendation 
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Applied</h2>
          <p className="text-sm text-gray-500 mb-3">Success state after user applies the recommendation.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Recommendation 
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Dismissed</h2>
          <p className="text-sm text-gray-500 mb-3">Neutral state after user dismisses the recommendation.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Recommendation 
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Custom Content</h2>
          <p className="text-sm text-gray-500 mb-3">Recommendation with customized title, impact, and description.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Recommendation 
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
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3 text-sm text-gray-700">
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

export default RecommendationComponentView;

