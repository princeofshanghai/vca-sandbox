import { useState } from 'react';
import { PromptGroup } from '@/components/vca-components/prompt-group';
import { Message } from '@/components/vca-components/messages';
import { Composer } from '@/components/vca-components/composer';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
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

  // State for the "Behavior" interactive example
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // AI responses for each prompt
  const promptResponses: Record<string, string> = {
    "How can I assign a seat to a user?": "To assign a seat to a user, go to Admin Settings > Seat Management. Click 'Assign Seat', select the user from the dropdown, and choose the seat type. The user will receive an email notification once the seat is assigned.",
    "What are the different user roles?": "Our platform has three main user roles: Admin (full access to all settings), Member (standard user access), and Guest (limited, view-only access). Each role has specific permissions that can be customized in the Role Management section.",
    "How do I manage licenses?": "To manage licenses, navigate to Settings > License Management. Here you can view active licenses, assign or revoke seats, purchase additional licenses, and track usage across your organization."
  };

  const handlePromptClick = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsThinking(true);
    setAiResponse(null);
    
    // Simulate AI thinking delay
    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(promptResponses[promptText]);
    }, 1500);
  };

  const resetDemo = () => {
    setSelectedPrompt(null);
    setIsThinking(false);
    setAiResponse(null);
  };

  return (
    <ComponentViewLayout
      title="Prompt Group"
      description="Grouping of multiple prompts."
    >
      
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
              label="Show AI icons"
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

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
        {/* Three Prompts */}
        <div>
          <h3 className="text-lg font-medium mb-2">Group prompts</h3>
          <p className="text-md text-gray-900 mb-3">Show multiple prompts at once.</p>
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

        {/* In context - After AI Message */}
        <div>
          <h3 className="text-lg font-medium mb-2">In context</h3>
          <p className="text-md text-gray-900 mb-3">Example showing prompt group after an AI message.</p>
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

        {/* Interaction Behavior */}
        <div>
          <h3 className="text-lg font-medium mb-2">Behavior</h3>
          <p className="text-md text-gray-900 mb-3">Clicking any prompt in the group instantly sends that text as a user message to the AI. Try clicking a prompt below.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg pt-0 pb-6 px-4 overflow-hidden">
            <div className="w-[400px] mx-auto">
              {/* Mini conversation view - focused and compact */}
              <div className="bg-vca-background border border-vca-border-faint rounded-b-vca-md overflow-hidden flex flex-col h-[480px] -mt-1">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto flex flex-col justify-end">
                  <div className="px-vca-xxl space-y-vca-lg pb-vca-lg">
                    {/* AI Message with prompt group */}
                    <Message 
                      type="ai" 
                      defaultText="Not sure where to start? You can try:"
                    />
                    
                    {/* Prompt group - only show if none selected */}
                    {!selectedPrompt && (
                      <PromptGroup 
                        prompts={[
                          { text: 'How can I assign a seat to a user?', showAiIcon: false, onClick: () => handlePromptClick("How can I assign a seat to a user?") },
                          { text: 'What are the different user roles?', showAiIcon: false, onClick: () => handlePromptClick("What are the different user roles?") },
                          { text: 'How do I manage licenses?', showAiIcon: false, onClick: () => handlePromptClick("How do I manage licenses?") },
                        ]}
                      />
                    )}
                    
                    {/* Show user message when prompt is clicked */}
                    {selectedPrompt && (
                      <div className="flex justify-end">
                        <Message 
                          type="user" 
                          userText={selectedPrompt}
                          errorFeedback={false}
                        />
                      </div>
                    )}
                    
                    {/* Show thinking indicator while AI is processing */}
                    {isThinking && (
                      <div className="flex items-center gap-vca-s">
                        <ThinkingIndicator />
                      </div>
                    )}
                    
                    {/* Show AI response after thinking */}
                    {aiResponse && (
                      <Message 
                        type="ai" 
                        defaultText={aiResponse}
                      />
                    )}
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
          <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Interactive demo:</span> {
                !selectedPrompt ? "Click any prompt above to see the full conversation flow." :
                isThinking ? "AI is thinking..." :
                aiResponse ? "Complete! The prompt became a user message and the AI responded." :
                "Loading..."
              }
            </p>
            {aiResponse && (
              <button
                onClick={resetDemo}
                className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default PromptGroupComponentView;

