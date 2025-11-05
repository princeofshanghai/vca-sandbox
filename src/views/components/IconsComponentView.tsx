import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';

const IconsComponentView = () => {
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
  ];

  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Icons</h1>
      <p className="text-md text-gray-500 mb-12">Custom LinkedIn SVG icons used throughout the VCA chatbot interface.</p>
      
      <div className="space-y-12">
        {/* All Icons Grid */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">All Icons</h2>
          <p className="text-sm text-gray-500 mb-3">Complete set of 23 VCA icons.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-4 gap-6">
              {icons.map((iconName) => (
                <div key={iconName} className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <VcaIcon icon={iconName} size="md" />
                  <span className="text-xs text-gray-600 text-center">{iconName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Sizes</h2>
          <p className="text-sm text-gray-500 mb-3">Icons available in three sizes.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="sm" />
                <span className="text-xs text-gray-500">Small (16px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="md" />
                <span className="text-xs text-gray-500">Medium (24px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <VcaIcon icon="send" size="lg" />
                <span className="text-xs text-gray-500">Large (32px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">By Category</h2>
          <p className="text-sm text-gray-500 mb-3">Icons organized by usage type.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-left" size="md" />
                  <span className="text-xs text-gray-500">arrow-left</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-up" size="md" />
                  <span className="text-xs text-gray-500">arrow-up</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="arrow-down" size="md" />
                  <span className="text-xs text-gray-500">arrow-down</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="chevron-down" size="md" />
                  <span className="text-xs text-gray-500">chevron-down</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="close" size="md" />
                  <span className="text-xs text-gray-500">close</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="send" size="md" />
                  <span className="text-xs text-gray-500">send</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="attachment" size="md" />
                  <span className="text-xs text-gray-500">attachment</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="check" size="md" />
                  <span className="text-xs text-gray-500">check</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="undo" size="md" />
                  <span className="text-xs text-gray-500">undo</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="trash" size="md" />
                  <span className="text-xs text-gray-500">trash</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="download" size="md" />
                  <span className="text-xs text-gray-500">download</span>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Signals & Status</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-ai" size="md" />
                  <span className="text-xs text-gray-500">signal-ai</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-success" size="md" />
                  <span className="text-xs text-gray-500">signal-success</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-error" size="md" />
                  <span className="text-xs text-gray-500">signal-error</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="signal-notice" size="md" />
                  <span className="text-xs text-gray-500">signal-notice</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-up-outline" size="md" />
                  <span className="text-xs text-gray-500">thumbs-up-outline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-up-fill" size="md" />
                  <span className="text-xs text-gray-500">thumbs-up-fill</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-down-outline" size="md" />
                  <span className="text-xs text-gray-500">thumbs-down-outline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="thumbs-down-fill" size="md" />
                  <span className="text-xs text-gray-500">thumbs-down-fill</span>
                </div>
              </div>
            </div>

            {/* Other */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Other</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="linkedin-bug" size="md" />
                  <span className="text-xs text-gray-500">linkedin-bug</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="document" size="md" />
                  <span className="text-xs text-gray-500">document</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VcaIcon icon="messages" size="md" />
                  <span className="text-xs text-gray-500">messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconsComponentView;

