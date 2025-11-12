import { useState } from 'react';
import { HumanAgentBanner } from '@/components/vca-components/human-agent-banner';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormInput } from '@/components/component-library/DemoControls';

const HumanAgentBannerComponentView = () => {
  // Interactive demo state
  const [agentName, setAgentName] = useState('John');

  return (
    <div className="pt-16">
      <h1 className="mb-2">Human Agent Banner</h1>
      <p className="text-md text-gray-500 mb-12">Banner displayed when user is in an active live chat session with a human agent.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormInput
              id="agentName"
              label="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name..."
            />
          </div>
        }
      >
        <div className="w-[400px]">
          <HumanAgentBanner
            agentName={agentName}
            onEndChat={() => alert('End chat clicked!')}
          />
        </div>
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* Active Live Chat */}
        <div>
          <h3 className="text-base font-medium mb-2">Active live chat</h3>
          <p className="text-sm text-gray-500 mb-4">Appears at the top of chat when user is connected to a human agent. Shows agent's online status and provides option to end the session.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto">
              <HumanAgentBanner
                agentName="Sarah Chen"
                onEndChat={() => alert('End chat clicked!')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanAgentBannerComponentView;

