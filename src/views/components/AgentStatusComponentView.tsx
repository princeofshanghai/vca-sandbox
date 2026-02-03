import { useState, useEffect } from 'react';
import { AgentStatus } from '@/components/vca-components/agent-status';
import { Message } from '@/components/vca-components/messages';
import { Composer } from '@/components/vca-components/composer';
import { Divider } from '@/components/vca-components/divider';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import type { AgentStatusState } from '@/components/vca-components/agent-status/AgentStatus';
import { ToggleButtons, FormInput, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const AgentStatusComponentView = () => {
  // Interactive demo state
  const [state, setState] = useState<AgentStatusState>('success');
  const [statusLabel, setStatusLabel] = useState("You're next in line");
  const [agentName, setAgentName] = useState('John');
  const [description, setDescription] = useState('A member of our team will join the chat soon.');
  const [actionLabel, setActionLabel] = useState('Cancel');
  const [showDescription, setShowDescription] = useState(true);
  const [showAction, setShowAction] = useState(true);

  // Behavior demo state
  type DemoStep = 'idle' | 'connecting' | 'connected' | 'agentMessage';
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');

  // Auto-advance through demo steps
  useEffect(() => {
    if (demoStep === 'idle') return;

    let timer: ReturnType<typeof setTimeout>;

    if (demoStep === 'connecting') {
      // After 2 seconds, show connected state
      timer = setTimeout(() => {
        setDemoStep('connected');
      }, 2000);
    } else if (demoStep === 'connected') {
      // After 1.5 seconds, show agent message
      timer = setTimeout(() => {
        setDemoStep('agentMessage');
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [demoStep]);

  const startDemo = () => {
    setDemoStep('connecting');
  };

  const resetDemo = () => {
    setDemoStep('idle');
  };

  return (
    <ComponentViewLayout
      title="Agent Status"
      description="Displays connection status when transferring to live agent."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="State"
                options={['connecting', 'success'] as const}
                value={state}
                onChange={setState}
              />

              <div></div>

              {state === 'connecting' ? (
                <>
                  <FormInput
                    id="statusLabel"
                    label="Status label"
                    value={statusLabel}
                    onChange={(e) => setStatusLabel(e.target.value)}
                    placeholder="Status label..."
                  />

                  <FormInput
                    id="actionLabel"
                    label="Action label"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="Action label..."
                  />

                  <FormTextarea
                    id="description"
                    label="Description text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description text..."
                    rows={2}
                    className="col-span-2"
                  />

                  <FormCheckbox
                    id="showDescription"
                    label="Show description"
                    checked={showDescription}
                    onCheckedChange={setShowDescription}
                  />

                  <FormCheckbox
                    id="showAction"
                    label="Show action"
                    checked={showAction}
                    onCheckedChange={setShowAction}
                  />
                </>
              ) : (
                <FormInput
                  id="agentName"
                  label="Agent name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name..."
                  className="col-span-2"
                />
              )}
            </div>
          }
        >
          <div className="w-[352px] mx-auto">
            <AgentStatus
              state={state}
              statusLabel={statusLabel}
              agentName={agentName}
              description={description}
              actionLabel={actionLabel}
              showDescription={showDescription}
              showAction={showAction}
              onAction={() => alert('Action clicked!')}
            />
          </div>
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Connecting State - Full */}
            <div>
              <h3 className="mb-2">Connecting (full)</h3>
              <p className="mb-3">Shows spinning progress indicator while connecting to live agent, with description and cancel action.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <AgentStatus
                    state="connecting"
                    statusLabel="Connecting with a member of our team"
                    description="Our team is joining soon for live chat. AI will not be responding at this moment."
                    actionLabel="Cancel"
                    showDescription={true}
                    showAction={true}
                  />
                </div>
              </div>
            </div>

            {/* Connected */}
            <div>
              <h3 className="mb-2">Connected</h3>
              <p className="mb-3">Shows success icon when agent has joined. Displays agent first name.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="w-[352px] mx-auto">
                  <AgentStatus
                    state="success"
                    agentName="John"
                  />
                </div>
              </div>
            </div>

            {/* Behavior Demo */}
            <div>
              <h3 className="mb-2">Behavior</h3>
              <p className="mb-3">Agent status transitions from connecting to connected, then agent sends first message.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg pt-0 pb-6 px-4 overflow-hidden">
                <div className="w-[400px] mx-auto">
                  {/* Mini conversation view - focused and compact */}
                  <div className="bg-vca-background border border-vca-border-faint rounded-b-vca-md overflow-hidden flex flex-col h-[480px] -mt-1">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto flex flex-col justify-end">
                      <div className="px-vca-xl space-y-vca-lg pb-vca-lg">
                        {/* User message */}
                        <div className="flex justify-end">
                          <Message
                            variant="user"
                            userText="I'd like to speak with a support agent"
                            errorFeedback={false}
                          />
                        </div>

                        {/* Connecting status */}
                        {demoStep === 'connecting' && (
                          <AgentStatus
                            state="connecting"
                            statusLabel="You're next in line"
                            description="A member of our team will join the chat soon."
                            actionLabel="Cancel"
                            showDescription={true}
                            showAction={true}
                          />
                        )}

                        {/* Divider + Connected status */}
                        {(demoStep === 'connected' || demoStep === 'agentMessage') && (
                          <>
                            <Divider text="LIVE CHAT" />
                            <AgentStatus
                              state="success"
                              agentName="John"
                            />
                          </>
                        )}

                        {/* Agent message */}
                        {demoStep === 'agentMessage' && (
                          <Message
                            variant="human-agent"
                            humanAgentText="Hi I'm John, how can I help you?"
                            agentName="John"
                            agentTimestamp="12:34 PM"
                          />
                        )}
                      </div>
                    </div>

                    {/* Composer at bottom */}
                    <Composer
                      status="default"
                      placeholder="Type your message..."
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">💡 Interactive demo:</span> {
                    demoStep === 'idle' ? "Click 'Start demo' to see the agent connection flow." :
                      demoStep === 'connecting' ? "Connecting to agent..." :
                        demoStep === 'connected' ? "Agent has joined!" :
                          demoStep === 'agentMessage' ? "Complete! Agent sent welcome message." :
                            "Loading..."
                  }
                </p>
                {demoStep === 'idle' ? (
                  <button
                    onClick={startDemo}
                    className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                  >
                    Start demo
                  </button>
                ) : demoStep === 'agentMessage' ? (
                  <button
                    onClick={resetDemo}
                    className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            </div>


          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default AgentStatusComponentView;

