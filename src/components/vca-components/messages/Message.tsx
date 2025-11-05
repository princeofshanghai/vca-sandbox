import { cn } from '@/utils';
import { VcaIcon } from '@/components/vca-components/icons';

// ============================================================
// Avatar Component
// ============================================================
type AvatarProps = {
  className?: string;
  badge?: boolean;
  size?: '32' | '20' | '24';
};

const Avatar = ({ className, badge = false, size = '20' }: AvatarProps) => {
  // Placeholder avatar - will be replaced with real images later
  const sizeMap = {
    '20': 'w-5 h-5',
    '24': 'w-6 h-6',
    '32': 'w-8 h-8',
  };

  return (
    <div className={cn('relative shrink-0', sizeMap[size], className)}>
      {/* Placeholder avatar circle */}
      <div className="absolute inset-0 bg-gray-300 rounded-full" />
      {badge && (
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

// ============================================================
// Agent Timestamp Component
// ============================================================
type AgentTimestampProps = {
  className?: string;
  text?: string;
};

const AgentTimestamp = ({ className, text = 'John, LinkedIn Support  1:32 PM' }: AgentTimestampProps) => {
  return (
    <div className={cn('flex gap-vca-s items-center', className)}>
      <Avatar size="24" />
      <p className="font-vca-text text-vca-xsmall text-vca-text-meta whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
};

// ============================================================
// Inline Feedback Component
// ============================================================
type InlineFeedbackProps = {
  className?: string;
  action?: boolean;
  type?: 'negative' | 'neutral' | 'positive';
  size?: 'sm' | 'md';
};

const InlineFeedback = ({ className, action = true, type = 'positive' }: InlineFeedbackProps) => {
  const isNegative = type === 'negative';
  const textColor = isNegative ? 'text-vca-text-negative' : 'text-vca-text-positive';
  const message = isNegative ? 'Not delivered.' : 'Success';
  const actionText = 'Try again';

  return (
    <div className={cn('flex gap-vca-xs items-center', className)}>
      <div className="flex gap-vca-s items-center">
        <VcaIcon 
          icon={isNegative ? 'signal-error' : 'signal-success'} 
          size="sm"
        />
        <p className={cn('font-vca-text text-vca-xsmall-open whitespace-nowrap', textColor)}>
          {message}
        </p>
      </div>
      {action && isNegative && (
        <p className={cn('font-vca-text text-vca-xsmall-bold-open underline whitespace-nowrap', textColor)}>
          {actionText}
        </p>
      )}
    </div>
  );
};

// ============================================================
// Main Message Component
// ============================================================
export type MessageProps = {
  errorFeedback?: boolean;
  showTimestamp?: boolean;
  memberText?: string;
  agentText?: string;
  disclaimerText?: string;
  defaultText?: string;
  type?: 'agent' | 'ai' | 'disclaimer' | 'member';
  className?: string;
};

export const Message = ({
  errorFeedback = false,
  showTimestamp = true,
  memberText = 'This is a member message ',
  agentText = 'This is an agent message',
  disclaimerText = 'This experience is powered by AI. Mistakes may be possible. ',
  defaultText = 'This is a message',
  type = 'ai',
  className,
}: MessageProps) => {
  // Disclaimer type - AI disclaimer with link
  if (type === 'disclaimer') {
    return (
      <div className={cn('flex flex-col gap-vca-lg items-start', className)}>
        <div className="flex flex-col gap-2 items-start w-full">
          <p className="font-vca-text text-vca-small-open text-vca-text">
            {disclaimerText}
            <span className="font-vca-text text-vca-small-bold-open text-vca-link">Learn more</span>
          </p>
        </div>
      </div>
    );
  }

  // Member type - User message bubble (right-aligned, beige)
  if (type === 'member') {
    return (
      <div className={cn('flex items-center justify-end', className)}>
        <div className="flex flex-col gap-vca-s items-end">
          <div className="bg-vca-background-neutral-soft flex flex-col items-start max-w-[320px] px-vca-md py-3 rounded-tl-vca-md rounded-bl-vca-md rounded-tr-vca-md">
            <p className="font-vca-text text-vca-small-open text-vca-text w-full">
              {memberText}
            </p>
          </div>
          {errorFeedback && <InlineFeedback type="negative" />}
        </div>
      </div>
    );
  }

  // Agent type - Agent message bubble (left-aligned, light blue)
  if (type === 'agent') {
    return (
      <div className={cn('flex gap-vca-s items-end', className)}>
        <div className="flex flex-col gap-2 items-start grow pb-1">
          <div className="bg-vca-background-tint-soft flex flex-col gap-vca-lg items-start max-w-[320px] p-vca-lg rounded-br-vca-md rounded-tl-vca-md rounded-tr-vca-md">
            <p className="font-vca-text text-vca-small-open text-vca-text w-full">
              {agentText}
            </p>
          </div>
          {showTimestamp && <AgentTimestamp />}
        </div>
      </div>
    );
  }

  // AI type - Plain message (no bubble)
  return (
    <div className={cn('flex flex-col gap-vca-lg items-start', className)}>
      <div className="flex flex-col gap-2 items-start w-full">
        <p className="font-vca-text text-vca-small-open text-vca-text w-full">
          {defaultText}
        </p>
      </div>
    </div>
  );
};

export default Message;

