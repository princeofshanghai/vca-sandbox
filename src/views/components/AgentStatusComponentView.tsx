import { AgentStatus } from '@/components/vca-components/agent-status';

const AgentStatusComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Agent Status</h1>
      <p className="text-md text-gray-500 mb-12">Connection status component for transferring users to live human agents.</p>
      
      <div className="space-y-12">
        {/* Connecting State - Full */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connecting (Full)</h2>
          <p className="text-sm text-gray-500 mb-3">Shows spinning progress indicator while connecting to live agent, with description and cancel action.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="connecting"
                statusLabel="Connecting with a member of our team"
                description="Our team is joining soon for live chat. AI will not be responding at this moment."
                actionLabel="Cancel"
                showUndo={true}
                showDescription={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Success State - Full */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connected (Full)</h2>
          <p className="text-sm text-gray-500 mb-3">Shows checkmark when successfully connected to live agent.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                description="You are now connected to a member of our support team. They will respond shortly."
                actionLabel="End chat"
                showUndo={true}
                showDescription={true}
                showAction={true}
              />
            </div>
          </div>
        </div>

        {/* Connecting - Simple (No Description, No Action) */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connecting (Minimal)</h2>
          <p className="text-sm text-gray-500 mb-3">Simplified connecting state with just status label and undo button.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="connecting"
                statusLabel="Connecting with a member of our team"
                showUndo={true}
                showDescription={false}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Success - Simple */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connected (Minimal)</h2>
          <p className="text-sm text-gray-500 mb-3">Simplified success state with just status label.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                showUndo={false}
                showDescription={false}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Connecting - No Undo */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connecting (No Undo)</h2>
          <p className="text-sm text-gray-500 mb-3">Connecting state without undo button.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="connecting"
                statusLabel="Connecting to support team"
                description="Please wait while we connect you to a live agent."
                showUndo={false}
                showDescription={true}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Success - With Description, No Action */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Connected (No Action)</h2>
          <p className="text-sm text-gray-500 mb-3">Success state with description but no action link.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <AgentStatus 
                state="success"
                statusLabel="Connected to live chat"
                description="A support agent will respond shortly. Thank you for your patience."
                showUndo={false}
                showDescription={true}
                showAction={false}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">Purpose:</span> Inform users about live agent connection status during handoff from AI to human support.</p>
              <p><span className="font-medium">Two States:</span> "connecting" (spinning progress indicator) and "success" (checkmark icon).</p>
              <p><span className="font-medium">Progress Spinner:</span> Uses CSS animation (animate-spin) for the connecting state indicator.</p>
              <p><span className="font-medium">Modular Features:</span> All elements (undo button, description, action link) are optional and toggleable.</p>
              <p><span className="font-medium">Light Blue Background:</span> Uses #f6fbff to match other informational components.</p>
              <p><span className="font-medium">No Fixed Width:</span> Adapts to parent container (no double padding issue).</p>
              <p><span className="font-medium">Common Actions:</span> "Cancel" during connecting, "End chat" after connected.</p>
              <p><span className="font-medium">Undo Button:</span> Allows users to cancel the agent connection request.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatusComponentView;

