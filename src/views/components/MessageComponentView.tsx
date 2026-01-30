import { useState } from 'react';
import { Message } from '@/components/vca-components/messages/Message';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormTextarea, FormCheckbox } from '@/components/component-library/DemoControls';

const MessageComponentView = () => {
  // Interactive demo state
  const [variant, setVariant] = useState<'ai' | 'user' | 'human-agent' | 'disclaimer'>('ai');
  const [text, setText] = useState('This is a sample message');
  const [errorFeedback, setErrorFeedback] = useState(false);

  // Determine which text prop to use based on type
  const getTextProps = () => {
    switch (variant) {
      case 'ai':
        return { defaultText: text };
      case 'user':
        return { userText: text };
      case 'human-agent':
        return { humanAgentText: text };
      case 'disclaimer':
        return {}; // disclaimer uses fixed text
      default:
        return { defaultText: text };
    }
  };

  return (
    <ComponentViewLayout
      title="Message"
      description="Used to display messages with distinct styling across AI, live agent, and user messages."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Variant"
                options={['ai', 'user', 'human-agent', 'disclaimer'] as const}
                value={variant}
                onChange={setVariant}
              />

              <FormCheckbox
                id="errorFeedback"
                label="Show error (user only)"
                checked={errorFeedback}
                onCheckedChange={setErrorFeedback}
                disabled={variant !== 'user'}
              />

              {variant !== 'disclaimer' && (
                <FormTextarea
                  id="text"
                  label="Message text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter message..."
                  rows={3}
                  className="col-span-2"
                />
              )}
            </div>
          }
        >
          <div className="w-[352px] mx-auto">
            <Message
              variant={variant}
              {...getTextProps()}
              errorFeedback={variant === 'user' ? errorFeedback : undefined}
            />
          </div>
        </DemoSection>

        {/* Usage Section */}
        <div>
          <h2 className="mb-8">Usage</h2>

          <div className="space-y-12">
            <div>
              <h3 className="mb-4">AI message</h3>
              <p className="mb-3">Messages sent by AI are basic with minimal styling.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <Message variant="ai" defaultText="Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can." />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">User message</h3>
              <p className="mb-3">User-submitted messages are displayed on the right, with a subtle beige background.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <Message variant="user" userText="Why was my contest campaign rejected if it falls within Linkedin Contest guidelines? I need that campaign to be running." />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">User message with error</h3>
              <p className="mb-3">Failed user messages can be re-submitted inline.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <Message variant="user" userText="This message failed to send" errorFeedback={true} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Human agent message</h3>
              <p className="mb-3">Live human agent messages are displayed with a subtle blue background, along with avatar, name, and timestamp.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <Message variant="human-agent" humanAgentText="Hi Nick, how can I help?" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ComponentViewLayout >
  );
};

export default MessageComponentView;

