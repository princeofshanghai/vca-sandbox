import { useState } from 'react';
import { AgentTimestamp } from '@/components/vca-components/agent-timestamp';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const AgentTimestampComponentView = () => {
  // Interactive demo state
  const [agentName, setAgentName] = useState('Rose');
  const [timestamp, setTimestamp] = useState('1:32 PM');
  const [showBadge, setShowBadge] = useState(true);

  return (
    <ComponentViewLayout
      title="Agent Timestamp"
      description="Displays agent avatar, name, and timestamp for human agent messages."
    >
      {/* Demo Section */}
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

            <FormInput
              id="timestamp"
              label="Timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="Enter timestamp..."
            />

            <FormCheckbox
              id="showBadge"
              label="Show badge"
              checked={showBadge}
              onCheckedChange={setShowBadge}
            />
          </div>
        }
      >
        <AgentTimestamp 
          agentName={agentName}
          timestamp={timestamp}
          showBadge={showBadge}
        />
      </DemoSection>
    </ComponentViewLayout>
  );
};

export default AgentTimestampComponentView;

