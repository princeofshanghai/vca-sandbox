import { useState } from 'react';
import { PromptGroup } from '@/components/vca-components/prompt-group';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';

const PromptGroupComponentView = () => {
  // Interactive demo state
  const [promptCount, setPromptCount] = useState<'1' | '2' | '3'>('3');
  const [showAiIcons, setShowAiIcons] = useState(false);

  const getPrompts = () => {
    const allPrompts = [
      { text: 'How can I assign a seat to a user?', showAiIcon: showAiIcons },
      { text: 'What are the different user roles?', showAiIcon: showAiIcons },
      { text: 'How do I manage licenses?', showAiIcon: showAiIcons },
    ];
    return allPrompts.slice(0, Number(promptCount));
  };

  return (
    <div className="pt-16">
      <h1 className="mb-2">Prompt Group</h1>
      <p className="text-md text-gray-500 mb-12">Vertical list of prompt suggestions for guided AI interactions.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Number of Prompts"
              options={['1', '2', '3'] as const}
              value={promptCount}
              onChange={setPromptCount}
            />

            <FormCheckbox
              id="showAiIcons"
              label="Show AI Icons"
              checked={showAiIcons}
              onCheckedChange={setShowAiIcons}
            />
          </div>
        }
      >
        <div className="px-vca-xxl">
          <PromptGroup prompts={getPrompts()} />
        </div>
      </DemoSection>

      <div className="space-y-12">
        {/* Three Prompts */}
        <div>
          <h2 className="mb-4">Three Prompts</h2>
          <p className="text-sm text-gray-500 mb-3">Standard group with three suggested prompts.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'How can I assign a seat to a user?', showAiIcon: false },
                  { text: 'What are the different user roles?', showAiIcon: false },
                  { text: 'How do I manage licenses?', showAiIcon: false },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Two Prompts */}
        <div>
          <h2 className="mb-4">Two Prompts</h2>
          <p className="text-sm text-gray-500 mb-3">Group with two suggested prompts.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'Tell me about premium features', showAiIcon: false },
                  { text: 'How do I upgrade my account?', showAiIcon: false },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Single Prompt */}
        <div>
          <h2 className="mb-4">Single Prompt</h2>
          <p className="text-sm text-gray-500 mb-3">Group with just one prompt.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'Show me getting started guide', showAiIcon: false },
                ]}
              />
            </div>
          </div>
        </div>

        {/* With AI Icons */}
        <div>
          <h2 className="mb-4">With AI Icons</h2>
          <p className="text-sm text-gray-500 mb-3">Prompts with AI sparkle icons to indicate AI-generated suggestions.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'What are best practices for seat management?', showAiIcon: true },
                  { text: 'How can I improve team productivity?', showAiIcon: true },
                  { text: 'What features should I enable first?', showAiIcon: true },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Mixed - Some with AI Icons */}
        <div>
          <h2 className="mb-4">Mixed Icons</h2>
          <p className="text-sm text-gray-500 mb-3">Group with mixed AI icon states.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'How do I add a new user?', showAiIcon: false },
                  { text: 'What automated workflows are recommended?', showAiIcon: true },
                  { text: 'Tell me about admin permissions', showAiIcon: false },
                ]}
              />
            </div>
          </div>
        </div>

        {/* In Context - After AI Message */}
        <div>
          <h2 className="mb-4">In Context</h2>
          <p className="text-sm text-gray-500 mb-3">Example showing prompt group after an AI message.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl space-y-4">
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                Hi there. With the help of AI, I can answer questions about administration or connect you to someone who can.
              </p>
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                Not sure where to start? You can try:
              </p>
              <PromptGroup 
                prompts={[
                  { text: 'How can I assign a seat to a user?', showAiIcon: false },
                  { text: 'What are seat allocation best practices?', showAiIcon: false },
                  { text: 'Show me user management options', showAiIcon: false },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Longer Text Examples */}
        <div>
          <h2 className="mb-4">Longer Text</h2>
          <p className="text-sm text-gray-500 mb-3">Prompts with longer text that wrap to multiple lines.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <PromptGroup 
                prompts={[
                  { text: 'Can you explain how to set up automated seat assignments for new team members joining our organization?', showAiIcon: true },
                  { text: 'What are the step-by-step instructions for creating custom user roles?', showAiIcon: true },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Purpose:</span> Group multiple prompt suggestions into a vertical stack for easier scanning and selection.</p>
              <p><span className="font-medium">Flexible Length:</span> Supports 1-N prompts (typically 2-4 for best UX).</p>
              <p><span className="font-medium">8px Spacing:</span> Consistent gap-vca-s (8px) between prompts.</p>
              <p><span className="font-medium">No Fixed Width:</span> Adapts to parent container (no double padding issue).</p>
              <p><span className="font-medium">Uses Prompt Component:</span> Each item is a Prompt component with full interactivity.</p>
              <p><span className="font-medium">Common Pattern:</span> Display after "Not sure where to start?" or "You can try:" text.</p>
              <p><span className="font-medium">AI Icons:</span> Each prompt can independently show or hide the AI sparkle icon.</p>
              <p><span className="font-medium">Clickable:</span> Each prompt in the group is individually clickable with its own onClick handler.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGroupComponentView;

