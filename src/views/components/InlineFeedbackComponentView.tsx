import { useState } from 'react';
import { InlineFeedback } from '@/components/vca-components/inline-feedback';
import type { InlineFeedbackType } from '@/components/vca-components/inline-feedback';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const InlineFeedbackComponentView = () => {
  // Interactive demo state
  const [type, setType] = useState<InlineFeedbackType>('positive');
  const [showAction, setShowAction] = useState(true);
  const [message, setMessage] = useState('');
  const [actionText, setActionText] = useState('Try again');

  return (
    <ComponentViewLayout
      title="Inline Feedback"
      description="Inline success/error feedback messages with optional action button."
    >
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Type"
              options={['positive', 'negative', 'neutral'] as const}
              value={type}
              onChange={setType}
            />

            <FormCheckbox
              id="showAction"
              label="Show action (negative only)"
              checked={showAction}
              onCheckedChange={setShowAction}
              disabled={type !== 'negative'}
            />

            <FormInput
              id="message"
              label="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave empty for default..."
              className="col-span-2"
            />

            {type === 'negative' && showAction && (
              <FormInput
                id="actionText"
                label="Action text"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Try again"
                className="col-span-2"
              />
            )}
          </div>
        }
      >
        <InlineFeedback 
          type={type}
          showAction={showAction}
          message={message || undefined}
          actionText={actionText}
          onActionClick={() => alert('Action clicked!')}
        />
      </DemoSection>
    </ComponentViewLayout>
  );
};

export default InlineFeedbackComponentView;

