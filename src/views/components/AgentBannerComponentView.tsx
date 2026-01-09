import { useState } from 'react';
import { AgentBanner } from '@/components/vca-components/agent-banner';
import { Header } from '@/components/vca-components/header';
import { Composer } from '@/components/vca-components/composer';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { FormInput } from '@/components/component-library/DemoControls';

const AgentBannerComponentView = () => {
  // Interactive demo state
  const [agentName, setAgentName] = useState('John');

  return (
    <ComponentViewLayout
      title="Agent Banner"
      description="Shows that user is in an active chat session with a live human agent."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <FormInput
                id="agentName"
                label="Agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name..."
              />
            </div>
          }
        >
          <div className="w-[400px]">
            <AgentBanner
              agentName={agentName}
              onEndChat={() => alert('End chat clicked!')}
            />
          </div>
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Active Live Chat */}
            <div>
              <h3 className="mb-2">Active live chat</h3>
              <p className="mb-3">Appears at the top of chat when user is connected to a human agent. Shows agent's online status and provides option to end the session.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg pt-6 pb-0 px-4 overflow-hidden">
                <div className="w-[400px] mx-auto">
                  {/* Mini conversation view - zoomed to top */}
                  <div className="bg-vca-background border border-vca-border-faint rounded-t-vca-md overflow-hidden flex flex-col h-[480px] -mb-1">
                    {/* Header at top */}
                    <Header
                      title="Help"
                      showBack={false}
                      showPremiumIcon={false}
                      showAction={false}
                      onClose={() => alert('Close clicked!')}
                    />

                    {/* Banner below header */}
                    <AgentBanner
                      agentName="John"
                      onEndChat={() => alert('End chat clicked!')}
                    />

                    {/* Scrollable content area - empty to focus on header and banner */}
                    <div className="flex-1 overflow-y-auto flex flex-col justify-end">
                      <div className="px-vca-xxl space-y-vca-lg pb-vca-lg">
                        {/* Empty - focus is on showing header + banner positioning */}
                      </div>
                    </div>

                    {/* Composer at bottom */}
                    <Composer
                      state="default"
                      placeholder="Ask a question..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ComponentViewLayout >
  );
};

export default AgentBannerComponentView;

