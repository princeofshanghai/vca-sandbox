import { Prompt } from '@/components/vca-components/prompt';

const PromptComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Prompt</h1>
      <p className="text-md text-gray-500 mb-12">Clickable suggestion chips for AI-powered prompts and quick actions.</p>
      
      <div className="space-y-12">
        {/* Without AI Icon */}
        <div>
          <h2 className="mb-4">Default</h2>
          <p className="text-sm text-gray-500 mb-3">Basic prompt without AI icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Prompt 
                text="How can I assign a seat to a user?"
                showAiIcon={false}
              />
            </div>
          </div>
        </div>

        {/* With AI Icon */}
        <div>
          <h2 className="mb-4">With AI Icon</h2>
          <p className="text-sm text-gray-500 mb-3">Prompt with sparkle AI icon to indicate AI-generated suggestion.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Prompt 
                text="What are the benefits of premium features?"
                showAiIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Multiple Prompts Example */}
        <div>
          <h2 className="mb-4">Multiple Prompts</h2>
          <p className="text-sm text-gray-500 mb-3">Example showing multiple prompt suggestions in a grid layout.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <div className="flex flex-wrap gap-2">
                <Prompt 
                  text="How do I add a new team member?"
                  showAiIcon={true}
                />
                <Prompt 
                  text="What's the difference between admin and user roles?"
                  showAiIcon={true}
                />
                <Prompt 
                  text="How can I export usage data?"
                  showAiIcon={true}
                />
                <Prompt 
                  text="Tell me about seat allocation"
                  showAiIcon={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* In Context Example */}
        <div>
          <h2 className="mb-4">In Context</h2>
          <p className="text-sm text-gray-500 mb-3">Example showing prompts after an AI message as suggested follow-ups.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl space-y-4">
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                Not sure where to start? You can try:
              </p>
              <div className="flex flex-col gap-2">
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
        </div>

        {/* Long Text Example */}
        <div>
          <h2 className="mb-4">Long Text</h2>
          <p className="text-sm text-gray-500 mb-3">Prompt with longer text that wraps to multiple lines.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Prompt 
                text="Can you explain the entire process of setting up and managing seat licenses for a large organization?"
                showAiIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Purpose:</span> Suggest follow-up questions, quick actions, or common queries to guide users.</p>
              <p><span className="font-medium">AI Icon:</span> Optional sparkle icon indicates AI-generated suggestions.</p>
              <p><span className="font-medium">Interactive:</span> Clickable button with hover state (lighter blue background).</p>
              <p><span className="font-medium">Max Width:</span> Constrained to 320px max width for optimal readability.</p>
              <p><span className="font-medium">Text Wrapping:</span> Text wraps to multiple lines if needed.</p>
              <p><span className="font-medium">Light Blue Background:</span> Uses #f6fbff (default) and #e8f3ff (hover).</p>
              <p><span className="font-medium">Blue Text:</span> Link color to indicate interactivity.</p>
              <p><span className="font-medium">Common Patterns:</span> Display 2-4 prompts after AI messages, or in a "Not sure where to start?" section.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptComponentView;

