import { useState } from 'react';
import { Header } from '@/components/vca-components/header';
import { DemoSection } from '@/components/component-library/DemoSection';
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
    <div className="pt-16">
      <h1 className="mb-2">Header</h1>
      <p className="text-md text-gray-500 mb-12">Chat panel header with title, navigation, and action buttons.</p>
      
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
              label="Title Text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />

            <FormCheckbox
              id="showBack"
              label="Show Back Button"
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
              label="Show Action Button"
              checked={showAction}
              onCheckedChange={setShowAction}
            />
            </div>
          </div>
        }
      >
        <div 
          className="mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden"
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

      <div className="space-y-12">
        {/* Left Aligned */}
        <div>
          <h2 className="mb-4">Left Aligned</h2>
          <p className="text-sm text-gray-500 mb-3">Title aligned to the left with back button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="left"
                showBack={true}
                showPremiumIcon={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Center Aligned */}
        <div>
          <h2 className="mb-4">Center Aligned</h2>
          <p className="text-sm text-gray-500 mb-3">Title centered in the header.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="center"
                showBack={true}
                showPremiumIcon={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Without Premium Icon */}
        <div>
          <h2 className="mb-4">Without Premium Icon</h2>
          <p className="text-sm text-gray-500 mb-3">Standard header without the LinkedIn premium bug icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="left"
                showBack={true}
                showPremiumIcon={false}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Without Back Button */}
        <div>
          <h2 className="mb-4">Without Back Button</h2>
          <p className="text-sm text-gray-500 mb-3">Header without navigation back button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="left"
                showBack={false}
                showPremiumIcon={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Premium Border */}
        <div>
          <h2 className="mb-4">Premium Border</h2>
          <p className="text-sm text-gray-500 mb-3">Header with gold bottom border for premium users.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Help"
                position="left"
                showBack={true}
                showPremiumIcon={true}
                showAction={true}
                showPremiumBorder={true}
              />
            </div>
          </div>
        </div>

        {/* Custom Title */}
        <div>
          <h2 className="mb-4">Custom Title</h2>
          <p className="text-sm text-gray-500 mb-3">Header with custom title text.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Header 
                title="Live chat with John"
                position="left"
                showBack={true}
                showPremiumIcon={false}
                showAction={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderComponentView;

