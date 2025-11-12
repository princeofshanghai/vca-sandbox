import { useState } from 'react';
import { HumanAgentStatus } from '@/components/vca-components/human-agent-status';
import { DemoSection } from '@/components/component-library/DemoSection';
import type { HumanAgentStatusState } from '@/components/vca-components/human-agent-status/HumanAgentStatus';
import { ToggleButtons, FormInput, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const HumanAgentStatusComponentView = () => {
  // Interactive demo state
  const [state, setState] = useState<HumanAgentStatusState>('success');
  const [statusLabel, setStatusLabel] = useState('Connected to live chat');
  const [description, setDescription] = useState('Our team is joining soon for live chat. AI will not be responding at this moment.');
  const [actionLabel, setActionLabel] = useState('Cancel');
  const [showDescription, setShowDescription] = useState(true);
  const [showAction, setShowAction] = useState(true);

  return (
    <div className="pt-16">
      <h1 className="mb-2">Human Agent Status</h1>
      <p className="text-md text-gray-500 mb-12">Connection status component for transferring users to live human agents.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="State"
              options={['connecting', 'success'] as const}
              value={state}
              onChange={setState}
            />

            <FormInput
              id="statusLabel"
              label="Status Label"
              value={statusLabel}
              onChange={(e) => setStatusLabel(e.target.value)}
              placeholder="Status label..."
            />

            <FormTextarea
              id="description"
              label="Description Text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description text..."
              rows={2}
              className="col-span-2"
            />

            <FormInput
              id="actionLabel"
              label="Action Label"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="Action label..."
            />

            <div></div>

            <FormCheckbox
              id="showDescription"
              label="Show Description"
              checked={showDescription}
              onCheckedChange={setShowDescription}
            />

            <FormCheckbox
              id="showAction"
              label="Show Action"
              checked={showAction}
              onCheckedChange={setShowAction}
            />
          </div>
        }
      >
        <div className="w-[352px] mx-auto">
          <HumanAgentStatus
            state={state}
            statusLabel={statusLabel}
            description={description}
            actionLabel={actionLabel}
            showDescription={showDescription}
            showAction={showAction}
            onAction={() => alert('Action clicked!')}
          />
        </div>
      </DemoSection>

      <div className="space-y-12">
        {/* Connecting State - Full */}
        <div>
          <h2 className="mb-4">Connecting (Full)</h2>
          <p className="text-sm text-gray-500 mb-3">Shows spinning progress indicator while connecting to live agent, with description and cancel action.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
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

        {/* Success State - Full */}
        <div>
          <h2 className="mb-4">Connected (Full)</h2>
          <p className="text-sm text-gray-500 mb-3">Shows success icon when successfully connected to live agent.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                description="You are now connected to a member of our support team. They will respond shortly."
                actionLabel="End chat"
                showDescription={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Connecting - Simple (No Description, No Action) */}
        <div>
          <h2 className="mb-4">Connecting (Minimal)</h2>
          <p className="text-sm text-gray-500 mb-3">Simplified connecting state with just status label.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
                state="connecting"
                statusLabel="Connecting with a member of our team"
                showDescription={false}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Success - Simple */}
        <div>
          <h2 className="mb-4">Connected (Minimal)</h2>
          <p className="text-sm text-gray-500 mb-3">Simplified success state with just status label.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                showDescription={false}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Connecting - With Description Only */}
        <div>
          <h2 className="mb-4">Connecting (With Description)</h2>
          <p className="text-sm text-gray-500 mb-3">Connecting state with description but no action link.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
                state="connecting"
                statusLabel="Connecting to support team"
                description="Please wait while we connect you to a live agent."
                showDescription={true}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Success - With Description, No Action */}
        <div>
          <h2 className="mb-4">Connected (No Action)</h2>
          <p className="text-sm text-gray-500 mb-3">Success state with description but no action link.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-[352px] mx-auto">
              <HumanAgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                description="A support agent will respond shortly. Thank you for your patience."
                showDescription={true}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Purpose:</span> Inform users about live agent connection status during handoff from AI to human support.</p>
              <p><span className="font-medium">Two States:</span> "connecting" (spinning progress indicator) and "success" (green checkmark icon).</p>
              <p><span className="font-medium">Progress Spinner:</span> Uses CSS animation (animate-spin) for the connecting state indicator.</p>
              <p><span className="font-medium">Left Aligned:</span> Content is left-aligned for better readability and consistency.</p>
              <p><span className="font-medium">Modular Features:</span> Both description and action link are optional and toggleable.</p>
              <p><span className="font-medium">Light Blue Background:</span> Uses #f6fbff to match other informational components.</p>
              <p><span className="font-medium">No Fixed Width:</span> Adapts to parent container (no double padding issue).</p>
              <p><span className="font-medium">Common Actions:</span> "Cancel" during connecting, "End chat" after connected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanAgentStatusComponentView;

