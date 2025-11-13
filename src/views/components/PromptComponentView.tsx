import { useState } from 'react';
import { Prompt } from '@/components/vca-components/prompt';
import { Message } from '@/components/vca-components/messages';
import { Composer } from '@/components/vca-components/composer';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const PromptComponentView = () => {
  // Interactive demo state
  const [text, setText] = useState('How can I assign a seat to a user?');
  const [showAiIcon, setShowAiIcon] = useState(false);
  
  // State for the "How it works" interactive example
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // AI responses for each prompt
  const promptResponses: Record<string, string> = {
    "How can I assign a seat to a user?": "To assign a seat to a user, go to Admin Settings > Seat Management. Click 'Assign Seat', select the user from the dropdown, and choose the seat type. The user will receive an email notification once the seat is assigned.",
    "What are seat allocation best practices?": "Best practices for seat allocation include: assigning seats based on role priority, maintaining a buffer for new hires, regularly auditing unused seats, and setting up automated assignment rules for common user types."
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
      title="Prompt"
      description="Suggested prompt button for quick actions."
    >
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormInput
              id="text"
              label="Prompt text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter prompt text..."
              className="col-span-2"
            />

            <FormCheckbox
              id="showAiIcon"
              label="Show AI icon"
              checked={showAiIcon}
              onCheckedChange={setShowAiIcon}
            />
          </div>
        }
      >
        <div className="px-vca-xxl">
          <Prompt 
            text={text}
            showAiIcon={showAiIcon}
            onClick={() => alert('Prompt clicked!')}
          />
        </div>
      </DemoSection>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Usage</h2>
      </div>

      <div className="space-y-12">
       

       


        {/* In context Example */}
        <div>
          <h3 className="text-lg font-medium mb-2">Intro message</h3>
          <p className="text-md text-gray-900 mb-3">Use prompts in intro message to the user to help them get started quickly.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg pt-0 pb-6 px-4 overflow-hidden">
            <div className="w-[400px] mx-auto">
              {/* Mini conversation view - focused and compact */}
              <div className="bg-vca-background border border-vca-border-faint rounded-b-vca-md overflow-hidden flex flex-col h-[480px] -mt-1">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto flex flex-col justify-end">
                  <div className="px-vca-xxl space-y-vca-lg pb-vca-lg">
                    {/* AI Message with intro text */}
                    <Message 
                      type="ai" 
                      defaultText="Hi there! I see you may need help with seat management. Ask me a question and I'll help you find the right answer."
                    />
                    
                    {/* AI Message with prompt intro */}
                    <Message 
                      type="ai" 
                      defaultText="You can try asking me something like:"
                    />
                    
                    {/* Prompt suggestions */}
                    <div className="flex flex-col gap-vca-s">
                      <Prompt 
                        text="How can I assign a seat to a user?"
                        showAiIcon={false}
                      />
                      <Prompt 
                        text="What are seat allocation best practices?"
                        showAiIcon={false}
                      />
                      <Prompt 
                        text="Show me user management options"
                        showAiIcon={false}
                      />
                    </div>
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

        {/* Interaction Behavior */}
        <div>
          <h3 className="text-lg font-medium mb-2">Behavior</h3>
          <p className="text-md text-gray-900 mb-3">Clicking a prompt instantly sends that text as a user message to the AI. Try clicking a prompt below.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg pt-0 pb-6 px-4 overflow-hidden">
            <div className="w-[400px] mx-auto">
              {/* Mini conversation view - focused and compact */}
              <div className="bg-vca-background border border-vca-border-faint rounded-b-vca-md overflow-hidden flex flex-col h-[480px] -mt-1">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto flex flex-col justify-end">
                  <div className="px-vca-xxl space-y-vca-lg pb-vca-lg">
                    {/* AI Message with prompts */}
                    <Message 
                      type="ai" 
                      defaultText="Not sure where to start? You can try:"
                    />
                    
                    {/* Prompt suggestions - only show if none selected */}
                    {!selectedPrompt && (
                      <div className="flex flex-col gap-vca-s">
                        <Prompt 
                          text="How can I assign a seat to a user?"
                          showAiIcon={false}
                          onClick={() => handlePromptClick("How can I assign a seat to a user?")}
                        />
                        <Prompt 
                          text="What are seat allocation best practices?"
                          showAiIcon={false}
                          onClick={() => handlePromptClick("What are seat allocation best practices?")}
                        />
                      </div>
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
                !selectedPrompt ? "Click a prompt above to see the full conversation flow." :
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

        {/* Usage notes */}

      </div>
    </ComponentViewLayout>
  );
};

export default PromptComponentView;

