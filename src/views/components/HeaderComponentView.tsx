import { useState } from 'react';
import { Header } from '@/components/vca-components/header';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import type { HeaderPosition } from '@/components/vca-components/header/Header';
import { ToggleButtons, FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const HeaderComponentView = () => {
  // Interactive demo state
  const [title, setTitle] = useState('Help');
  const [position, setPosition] = useState<HeaderPosition>('left');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [showBack, setShowBack] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showAction, setShowAction] = useState(false);

  return (
    <ComponentViewLayout
      title="Header"
      description="Chat container header that varies across desktop and mobile."
    >
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="space-y-4">
            {/* Viewport Toggle - Full Width */}
            <div className="pb-4 border-b border-gray-200">
              <ToggleButtons
                label="Viewport"
                options={['desktop', 'mobile'] as const}
                value={viewport}
                onChange={setViewport}
              />
            </div>

            {/* Other Controls - Grid Layout */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Position"
              options={['left', 'center'] as const}
              value={position}
              onChange={setPosition}
            />

            <FormInput
              id="title"
              label="Title text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />

            <FormCheckbox
              id="showBack"
              label="Show back button"
              checked={showBack}
              onCheckedChange={setShowBack}
            />

            <FormCheckbox
                id="isPremium"
                label="Premium (icon + border)"
                checked={isPremium}
                onCheckedChange={setIsPremium}
            />

            <FormCheckbox
              id="showAction"
              label="Show action button"
              checked={showAction}
              onCheckedChange={setShowAction}
            />
            </div>
          </div>
        }
      >
        <div 
          className="mx-auto my-4 border-t border-x border-gray-200 rounded-lg overflow-hidden"
          style={{ width: viewport === 'mobile' ? '393px' : '400px' }}
        >
          <Header
            title={title}
            position={position}
            viewport={viewport}
            showBack={showBack}
            showPremiumIcon={isPremium}
            showAction={showAction}
            showPremiumBorder={isPremium}
            onBack={() => alert('Back clicked!')}
            onAction={() => alert('Action clicked!')}
            onClose={() => alert('Close clicked!')}
          />
        </div>
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* Desktop */}
        <div>
          <h3 className="text-lg font-medium mb-2">Desktop</h3>
          <p className="text-md text-gray-900 mb-3">Desktop shows Help title and close button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border-t border-x border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="left"
                viewport="desktop"
                showBack={false}
                showPremiumIcon={false}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div>
          <h3 className="text-lg font-medium mb-2">Mobile</h3>
          <p className="text-md text-gray-900 mb-3">Mobile includes a centered handle bar and close button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[393px] mx-auto my-4 border-t border-x border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                viewport="mobile"
              />
            </div>
          </div>
        </div>

        {/* Premium */}
        <div>
          <h3 className="text-lg font-medium mb-2">Premium (WIP)</h3>
          <p className="text-md text-gray-900 mb-3">Premium users have unique Premium styling.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-4">
            <div className="space-y-4">
              {/* Desktop Premium */}
              <div className="w-[400px] mx-auto border-t border-x border-gray-200 rounded-lg overflow-hidden">
                <Header 
                  title="Help"
                  position="left"
                  viewport="desktop"
                  showBack={false}
                  showPremiumIcon={true}
                  showAction={false}
                  showPremiumBorder={true}
                />
              </div>
              
              {/* Mobile Premium */}
              <div className="w-[393px] mx-auto border-t border-x border-gray-200 rounded-lg overflow-hidden">
                <Header 
                  title="Help"
                  viewport="mobile"
                  showPremiumBorder={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default HeaderComponentView;

