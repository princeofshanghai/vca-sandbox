import { useState } from 'react';
import { Divider } from '@/components/vca-components/divider';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { FormInput } from '@/components/component-library/DemoControls';

const DividerComponentView = () => {
  // Interactive demo state
  const [text, setText] = useState('LIVE CHAT');

  return (
    <ComponentViewLayout
      title="Divider"
      description="Used to indicate transition to live chat and status."
    >
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              id="text"
              label="Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
            />
          </div>
        }
      >
        <div className="w-[400px] mx-auto">
          <Divider text={text} />
        </div>
      </DemoSection>

      {/* Usage Section */}
      <div className="mt-16">
        <h2 className="mb-8">Usage</h2>
        
        <div className="space-y-12">
          <div>
            <h3 className="mb-4">Live chat mode</h3>
            <p className="mb-3">Indicates transition to live chat with a human agent.</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="w-[400px] mx-auto">
                <Divider text="LIVE CHAT" />
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default DividerComponentView;

