import { Message } from '@/components/vca-components/messages/Message';

const MessageComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Message</h1>
      <p className="text-md text-gray-500 mb-12">Display AI, member, agent, and disclaimer messages in the chatbot interface.</p>
      
      <div className="space-y-12">
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">AI Message</h2>
          <p className="text-sm text-gray-500 mb-3">Default AI-generated response with sparkle icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Message type="ai" defaultText="This is a default AI message" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Disclaimer</h2>
          <p className="text-sm text-gray-500 mb-3">Legal disclaimer text displayed at the start of conversations.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Message type="disclaimer" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Member Message</h2>
          <p className="text-sm text-gray-500 mb-3">User-submitted message displayed on the right side.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Message type="member" memberText="This is a member message" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Member Message with Error</h2>
          <p className="text-sm text-gray-500 mb-3">Failed message with error indicator and retry action.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Message type="member" memberText="This message failed to send" errorFeedback={true} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Agent Message</h2>
          <p className="text-sm text-gray-500 mb-3">Human support agent message with avatar and name.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Message type="agent" agentText="This is an agent support message" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComponentView;

