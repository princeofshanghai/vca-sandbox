import { ButtonIcon } from '@/components/vca-components/buttons';

const ButtonIconComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Button Icon</h1>
      <p className="text-md text-gray-500 mb-12">Circular icon-only buttons for compact actions without text labels.</p>
      
      <div className="space-y-12">
        {/* Small Size */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Small (32px)</h2>
          <p className="text-sm text-gray-500 mb-3">Compact icon buttons for tight spaces like input fields.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Primary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="primary" size="sm" emphasis={true} icon="send" />
                  <ButtonIcon type="primary" size="sm" emphasis={true} icon="close" />
                  <ButtonIcon type="primary" size="sm" emphasis={true} icon="check" />
                  <ButtonIcon type="primary" size="sm" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Primary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="primary" size="sm" emphasis={false} icon="send" />
                  <ButtonIcon type="primary" size="sm" emphasis={false} icon="close" />
                  <ButtonIcon type="primary" size="sm" emphasis={false} icon="check" />
                  <ButtonIcon type="primary" size="sm" emphasis={false} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Secondary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="secondary" size="sm" emphasis={true} icon="send" />
                  <ButtonIcon type="secondary" size="sm" emphasis={true} icon="close" />
                  <ButtonIcon type="secondary" size="sm" emphasis={true} icon="check" />
                  <ButtonIcon type="secondary" size="sm" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Secondary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="secondary" size="sm" emphasis={false} icon="send" />
                  <ButtonIcon type="secondary" size="sm" emphasis={false} icon="close" />
                  <ButtonIcon type="secondary" size="sm" emphasis={false} icon="check" />
                  <ButtonIcon type="secondary" size="sm" emphasis={false} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Tertiary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="tertiary" size="sm" emphasis={true} icon="send" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={true} icon="close" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={true} icon="check" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Tertiary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="tertiary" size="sm" emphasis={false} icon="send" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={false} icon="close" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={false} icon="check" />
                  <ButtonIcon type="tertiary" size="sm" emphasis={false} icon="send" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medium Size */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Medium (48px)</h2>
          <p className="text-sm text-gray-500 mb-3">Larger icon buttons for more prominent actions.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Primary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="primary" size="md" emphasis={true} icon="send" />
                  <ButtonIcon type="primary" size="md" emphasis={true} icon="close" />
                  <ButtonIcon type="primary" size="md" emphasis={true} icon="check" />
                  <ButtonIcon type="primary" size="md" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Primary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="primary" size="md" emphasis={false} icon="send" />
                  <ButtonIcon type="primary" size="md" emphasis={false} icon="close" />
                  <ButtonIcon type="primary" size="md" emphasis={false} icon="check" />
                  <ButtonIcon type="primary" size="md" emphasis={false} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Secondary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="secondary" size="md" emphasis={true} icon="send" />
                  <ButtonIcon type="secondary" size="md" emphasis={true} icon="close" />
                  <ButtonIcon type="secondary" size="md" emphasis={true} icon="check" />
                  <ButtonIcon type="secondary" size="md" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Secondary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="secondary" size="md" emphasis={false} icon="send" />
                  <ButtonIcon type="secondary" size="md" emphasis={false} icon="close" />
                  <ButtonIcon type="secondary" size="md" emphasis={false} icon="check" />
                  <ButtonIcon type="secondary" size="md" emphasis={false} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Tertiary Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="tertiary" size="md" emphasis={true} icon="send" />
                  <ButtonIcon type="tertiary" size="md" emphasis={true} icon="close" />
                  <ButtonIcon type="tertiary" size="md" emphasis={true} icon="check" />
                  <ButtonIcon type="tertiary" size="md" emphasis={true} icon="send" disabled />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Tertiary Low Emphasis</p>
                <div className="flex gap-3 items-center">
                  <ButtonIcon type="tertiary" size="md" emphasis={false} icon="send" />
                  <ButtonIcon type="tertiary" size="md" emphasis={false} icon="close" />
                  <ButtonIcon type="tertiary" size="md" emphasis={false} icon="check" />
                  <ButtonIcon type="tertiary" size="md" emphasis={false} icon="send" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonIconComponentView;

