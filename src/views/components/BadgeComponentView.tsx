import { Badge } from '@/components/vca-components/badge';

const BadgeComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Badge</h1>
      <p className="text-md text-gray-500 mb-12">Small circular status indicators for showing availability on avatars.</p>
      
      <div className="space-y-12">
        {/* States */}
        <div>
          <h2 className="mb-4">States</h2>
          <p className="text-sm text-gray-500 mb-3">Two status states for user availability.</p>
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
          <h2 className="mb-4">Size Reference</h2>
          <p className="text-sm text-gray-500 mb-3">Badge is 8px × 8px (fixed size).</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <Badge state="online" />
              <span className="text-xs text-gray-500">8px × 8px</span>
            </div>
          </div>
        </div>

        {/* Usage with Avatar */}
        <div>
          <h2 className="mb-4">Usage Example</h2>
          <p className="text-sm text-gray-500 mb-3">Badge is typically used with the Avatar component to show status.</p>
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

