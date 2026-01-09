import { cn } from '@/utils';
import { AgentTimestamp } from '../agent-timestamp';
import { InlineFeedback } from '../inline-feedback';

// ============================================================
// Main Message Component
// ============================================================
export type MessageProps = {
  errorFeedback?: boolean;
  showTimestamp?: boolean;
  userText?: string;
  humanAgentText?: string;
  disclaimerText?: string;
  defaultText?: string | React.ReactNode;
  agentTimestampText?: string;
  type?: 'human-agent' | 'ai' | 'disclaimer' | 'user';
  className?: string;
};

export const Message = ({
  errorFeedback = false,
  showTimestamp = true,
  userText = 'This is a user message ',
  humanAgentText = 'This is a human agent message',
  disclaimerText = 'This AI-powered chat may make mistakes. ',
  defaultText = 'This is a message',
  agentTimestampText,
  type = 'ai',
  className,
}: MessageProps) => {
  // Disclaimer type - AI disclaimer with link
  if (type === 'disclaimer') {
    return (
      <div className={cn('flex flex-col gap-vca-lg items-start', className)}>
        <div className="flex flex-col gap-vca-s items-start w-full">
          <p className="font-vca-text text-vca-xsmall-open text-vca-text">
            {disclaimerText}
            <span className="font-vca-text text-vca-xsmall-bold-open text-vca-link">Learn more</span>
          </p>
        </div>
      </div>
    );
  }

  // User type - User message bubble (right-aligned, beige)
  if (type === 'user') {
    return (
      <div className={cn('flex items-center justify-end', className)}>
        <div className="flex flex-col gap-vca-s items-end">
          <div className="bg-vca-background-neutral-soft flex flex-col items-start max-w-[320px] px-vca-md py-3 rounded-tl-vca-md rounded-bl-vca-md rounded-tr-vca-md">
            <p className="font-vca-text text-vca-small-open text-vca-text w-full">
              {userText}
            </p>
          </div>
          {errorFeedback && <InlineFeedback type="negative" showAction={true} />}
        </div>
      </div>
    );
  }

  // Human Agent type - Agent message bubble (left-aligned, light blue)
  if (type === 'human-agent') {
    return (
      <div className={cn('flex gap-vca-s items-end', className)}>
        <div className="flex flex-col gap-vca-s items-start grow pb-1">
          <div className="bg-vca-background-tint-soft flex flex-col gap-vca-lg items-start max-w-[320px] p-vca-lg rounded-br-vca-md rounded-tl-vca-md rounded-tr-vca-md">
            <p className="font-vca-text text-vca-small-open text-vca-text w-full">
              {humanAgentText}
            </p>
          </div>
          {showTimestamp && (
            <AgentTimestamp
              text={agentTimestampText}
              showBadge={true}
            />
          )}
        </div>
      </div>
    );
  }

  // AI type - Plain message (no bubble)
  return (
    <div className={cn('flex flex-col gap-vca-lg items-start', className)}>
      <div className="flex flex-col gap-vca-s items-start w-full">
        <div className="font-vca-text text-vca-small-open text-vca-text w-full [&_p]:text-vca-small-open [&_ul]:text-vca-small-open [&_ol]:text-vca-small-open [&_li]:text-vca-small-open">
          {defaultText}
        </div>
      </div>
    </div>
  );
};

export default Message;

