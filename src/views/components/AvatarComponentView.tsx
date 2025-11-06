import { Avatar } from '@/components/vca-components/avatar';

const AvatarComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Avatar</h1>
      <p className="text-md text-gray-500 mb-12">Circular profile images with optional status badges for showing user availability.</p>
      
      <div className="space-y-12">
        {/* Sizes */}
        <div>
          <h2 className="mb-4">Sizes</h2>
          <p className="text-sm text-gray-500 mb-3">Three sizes for different contexts.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">20px</p>
                <Avatar size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">24px</p>
                <Avatar size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">32px</p>
                <Avatar size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* With Badge */}
        <div>
          <h2 className="mb-4">With Status Badge</h2>
          <p className="text-sm text-gray-500 mb-3">Avatars with availability status indicators.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Online (Available)</p>
                <div className="flex items-end gap-4">
                  <Avatar size={20} showBadge badgeState="online" />
                  <Avatar size={24} showBadge badgeState="online" />
                  <Avatar size={32} showBadge badgeState="online" />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Offline (Unavailable)</p>
                <div className="flex items-end gap-4">
                  <Avatar size={20} showBadge badgeState="offline" />
                  <Avatar size={24} showBadge badgeState="offline" />
                  <Avatar size={32} showBadge badgeState="offline" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage in Context */}
        <div>
          <h2 className="mb-4">Usage Examples</h2>
          <p className="text-sm text-gray-500 mb-3">Avatars used in different chat contexts.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Agent Message Header</p>
                <div className="flex items-center gap-2">
                  <Avatar size={24} showBadge badgeState="online" />
                  <span className="text-sm font-medium text-gray-900">Support Agent</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Member Profile</p>
                <div className="flex items-center gap-3">
                  <Avatar size={32} showBadge badgeState="online" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">Available to chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarComponentView;

