import { Composer } from '@/components/vca-components/composer';

const ComposerComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-medium text-gray-900 mb-2 tracking-tight">Composer</h1>
      <p className="text-md text-gray-500 mb-12">Text input component for composing messages with multiple states and attachments.</p>
      
      <div className="space-y-12">
        {/* Default State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Default</h2>
          <p className="text-sm text-gray-500 mb-3">Empty input field ready for user input.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="default" />
          </div>
        </div>

        {/* Active State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Active (Focused)</h2>
          <p className="text-sm text-gray-500 mb-3">Input field in focused state with cursor blinker.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="active" />
          </div>
        </div>

        {/* Typing State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Typing</h2>
          <p className="text-sm text-gray-500 mb-3">Input field with text being entered.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="typing" value="How to" />
          </div>
        </div>

        {/* Multiline State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Multiline</h2>
          <p className="text-sm text-gray-500 mb-3">Expanded input for longer messages (max 4 lines).</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer 
              state="multiline" 
              value="Use this component when the content is more than two lines. The input box reaches its maximum height at 4 lines."
            />
          </div>
        </div>

        {/* Disabled State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Disabled</h2>
          <p className="text-sm text-gray-500 mb-3">Non-interactive disabled state.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="disabled" />
          </div>
        </div>

        {/* Stop State */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Stop Answering</h2>
          <p className="text-sm text-gray-500 mb-3">Special state shown when AI is generating a response.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="stop" />
          </div>
        </div>

        {/* Without Attachment */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Without Attachment</h2>
          <p className="text-sm text-gray-500 mb-3">Composer without the attachment icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Composer state="default" attachment={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposerComponentView;

