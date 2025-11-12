import { useState } from 'react';
import { Composer } from '@/components/vca-components/composer';
import { DemoSection } from '@/components/component-library/DemoSection';
import type { ComposerState } from '@/components/vca-components/composer/Composer';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';
import { Label } from '@/components/ui/label';

const ComposerComponentView = () => {
  // Interactive demo state
  const [manualState, setManualState] = useState<ComposerState | null>(null);
  const [attachment, setAttachment] = useState(true);
  const [value, setValue] = useState('');

  // Auto-determine state based on interaction (unless manually overridden)
  const getActiveState = (): ComposerState => {
    if (manualState === 'disabled' || manualState === 'stop') {
      return manualState;
    }
    
    // Auto states based on content
    if (value.length > 60 || value.includes('\n')) {
      return 'multiline';
    }
    if (value.length > 0) {
      return 'typing';
    }
    return 'default';
  };

  const activeState = getActiveState();

  const handleStateClick = (s: ComposerState) => {
    // Toggle manual state - if clicking the same state, turn off manual mode
    if (manualState === s) {
      setManualState(null);
    } else {
      setManualState(s);
    }
  };

  return (
    <div className="pt-16">
      <h1 className="mb-2">Composer</h1>
      <p className="text-md text-gray-500 mb-12">Text input component for composing messages with multiple states and attachments.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* State Override */}
            <div className="col-span-2 space-y-2">
              <div>
                <Label className="text-xs">State override</Label>
                <p className="text-xs text-muted-foreground">(auto-updates based on typing, or click to lock)</p>
              </div>
              <ToggleButtons
                label=""
                options={['disabled', 'stop'] as const}
                value={manualState || 'disabled'}
                onChange={(s) => handleStateClick(s)}
              />
              <p className="text-xs text-muted-foreground">
                Current state: <span className="font-medium">{activeState}</span>
              </p>
            </div>

            <FormCheckbox
              id="attachment"
              label="Show Attachment Icon"
              checked={attachment}
              onCheckedChange={setAttachment}
            />
          </div>
        }
      >
        <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
          <Composer
            state={activeState}
            value={value}
            attachment={attachment}
            onSend={() => {
              alert('Send clicked!');
              setValue('');
              setManualState(null);
            }}
            onStop={() => {
              alert('Stop clicked!');
              setManualState(null);
            }}
            onChange={setValue}
          />
        </div>
      </DemoSection>

      <div className="space-y-12">
        {/* Default State */}
        <div>
          <h2 className="mb-4">Default</h2>
          <p className="text-sm text-gray-500 mb-3">Empty input field ready for user input.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="default" />
            </div>
          </div>
        </div>

        {/* Active State */}
        <div>
          <h2 className="mb-4">Active (Focused)</h2>
          <p className="text-sm text-gray-500 mb-3">Input field in focused state with cursor blinker.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="active" />
            </div>
          </div>
        </div>

        {/* Typing State */}
        <div>
          <h2 className="mb-4">Typing</h2>
          <p className="text-sm text-gray-500 mb-3">Input field with text being entered.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="typing" value="How to" />
            </div>
          </div>
        </div>

        {/* Multiline State */}
        <div>
          <h2 className="mb-4">Multiline</h2>
          <p className="text-sm text-gray-500 mb-3">Expanded input for longer messages (max 4 lines).</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer 
                state="multiline" 
                value="Use this component when the content is more than two lines. The input box reaches its maximum height at 4 lines."
              />
            </div>
          </div>
        </div>

        {/* Disabled State */}
        <div>
          <h2 className="mb-4">Disabled</h2>
          <p className="text-sm text-gray-500 mb-3">Non-interactive disabled state.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="disabled" />
            </div>
          </div>
        </div>

        {/* Stop State */}
        <div>
          <h2 className="mb-4">Stop Answering</h2>
          <p className="text-sm text-gray-500 mb-3">Special state shown when AI is generating a response.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="stop" />
            </div>
          </div>
        </div>

        {/* Without Attachment */}
        <div>
          <h2 className="mb-4">Without Attachment</h2>
          <p className="text-sm text-gray-500 mb-3">Composer without the attachment icon.</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-[400px] mx-auto my-4 border border-gray-200 rounded-lg overflow-hidden">
              <Composer state="default" attachment={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposerComponentView;

