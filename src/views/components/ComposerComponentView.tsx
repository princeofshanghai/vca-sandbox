import { useState } from 'react';
import { Composer } from '@/components/vca-components/composer';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import type { ComposerStatus } from '@/components/vca-components/composer/Composer';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';
import { Label } from '@/components/ui/label';

const ComposerComponentView = () => {
  // Interactive demo state
  const [manualState, setManualState] = useState<ComposerStatus | null>(null);
  const [attachment, setAttachment] = useState(true);
  const [value, setValue] = useState('');

  // Auto-determine state based on interaction (unless manually overridden)
  const getActiveState = (): ComposerStatus => {
    if (manualState) {
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

  const handleStateClick = (s: ComposerStatus) => {
    // Toggle manual state - if clicking the same state, turn off manual mode
    if (manualState === s) {
      setManualState(null);
    } else {
      setManualState(s);
    }
  };

  return (
    <ComponentViewLayout
      title="Composer"
      description="Text input area for composing messages."
    >

      {/* Demo Section */}
      <div className="space-y-20">
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
                  options={['default', 'active', 'typing', 'multiline', 'disabled', 'stop'] as const}
                  value={manualState || 'disabled'}
                  onChange={(s) => handleStateClick(s)}
                />
                <p className="text-xs text-muted-foreground">
                  Current state: <span className="font-medium">{activeState}</span>
                </p>
              </div>

              <FormCheckbox
                id="attachment"
                label="Show attachment icon"
                checked={attachment}
                onCheckedChange={setAttachment}
              />
            </div>
          }
        >
          <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
            <Composer
              status={activeState}
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

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Default State */}
            <div>
              <h3 className="mb-2">Default</h3>
              <p className="mb-3">Empty input field ready for user input.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="default" />
                </div>
              </div>
            </div>

            {/* Active State */}
            <div>
              <h3 className="mb-2">Active (focused)</h3>
              <p className="mb-3">Input field in focused state with cursor blinker.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="active" />
                </div>
              </div>
            </div>

            {/* Typing State */}
            <div>
              <h3 className="mb-2">Typing</h3>
              <p className="mb-3">Input field with text being entered.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="typing" value="How to" />
                </div>
              </div>
            </div>

            {/* Ready to send State */}
            <div>
              <h3 className="mb-2">Ready to Send</h3>
              <p className="mb-3">Input field with content, enabling the send button.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="typing" value="Hello world" />
                </div>
              </div>
            </div>

            {/* Multiline State */}
            <div>
              <h3 className="mb-2">Multiline</h3>
              <p className="mb-3">Expanded input for longer messages (max 4 lines).</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer
                    status="multiline"
                    value="Use this component when the content is more than two lines. The input box reaches its maximum height at 4 lines."
                  />
                </div>
              </div>
            </div>

            {/* Disabled State */}
            <div>
              <h3 className="mb-2">Disabled</h3>
              <p className="mb-3">Non-interactive disabled state.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="disabled" />
                </div>
              </div>
            </div>

            {/* Stop State */}
            <div>
              <h3 className="mb-2">Stop answering</h3>
              <p className="mb-3">Special state shown when AI is generating a response.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="stop" />
                </div>
              </div>
            </div>

            {/* Without attachment */}
            <div>
              <h3 className="mb-2">Without attachment</h3>
              <p className="mb-3">Composer without the attachment icon.</p>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-[400px] mx-auto my-4 border-b border-x border-gray-200 rounded-lg overflow-hidden">
                  <Composer status="default" attachment={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default ComposerComponentView;

