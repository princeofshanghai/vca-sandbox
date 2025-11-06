import { Header } from '@/components/vca-components/header';

const HeaderComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Header</h1>
      <p className="text-md text-gray-500 mb-12">Chat panel header with title, navigation, and action buttons.</p>
      
      <div className="space-y-12">
        {/* Left Aligned */}
        <div>
          <h2 className="mb-4">Left Aligned</h2>
          <p className="text-sm text-gray-500 mb-3">Title aligned to the left with back button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Header 
              title="Help"
              position="left"
              showBack={true}
              showPremiumIcon={true}
              showAction={true}
            />
          </div>
        </div>

        {/* Center Aligned */}
        <div>
          <h2 className="mb-4">Center Aligned</h2>
          <p className="text-sm text-gray-500 mb-3">Title centered in the header.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Header 
              title="Help"
              position="center"
              showBack={true}
              showPremiumIcon={true}
              showAction={true}
            />
          </div>
        </div>

        {/* Without Premium Icon */}
        <div>
          <h2 className="mb-4">Without Premium Icon</h2>
          <p className="text-sm text-gray-500 mb-3">Standard header without the LinkedIn premium bug icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Header 
              title="Help"
              position="left"
              showBack={true}
              showPremiumIcon={false}
              showAction={true}
            />
          </div>
        </div>

        {/* Without Back Button */}
        <div>
          <h2 className="mb-4">Without Back Button</h2>
          <p className="text-sm text-gray-500 mb-3">Header without navigation back button.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Header 
              title="Help"
              position="left"
              showBack={false}
              showPremiumIcon={true}
              showAction={true}
            />
          </div>
        </div>

        {/* Premium Border */}
        <div>
          <h2 className="mb-4">Premium Border</h2>
          <p className="text-sm text-gray-500 mb-3">Header with gold bottom border for premium users.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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

        {/* Custom Title */}
        <div>
          <h2 className="mb-4">Custom Title</h2>
          <p className="text-sm text-gray-500 mb-3">Header with custom title text.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
  );
};

export default HeaderComponentView;

