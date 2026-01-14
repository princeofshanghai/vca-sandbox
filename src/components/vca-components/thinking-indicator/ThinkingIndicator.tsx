import { cn } from '@/utils';

export type ThinkingIndicatorProps = {
  className?: string;
};

/**
 * ThinkingIndicator - Animated dots showing AI is thinking/processing
 * Displays 3 dots that pulse in sequence to indicate loading state
 */
export const ThinkingIndicator = ({
  className,
}: ThinkingIndicatorProps) => {
  return (
    <div className={cn('flex gap-vca-xs items-center', className)}>
      <style>
        {`
          @keyframes vca-thinking-dot {
            0%, 60%, 100% { opacity: 0.4; }
            30% { opacity: 1; }
          }
        `}
      </style>

      {/* Dot 1 */}
      <div
        className="w-2 h-2 rounded-full bg-vca-text"
        style={{
          animation: 'vca-thinking-dot 1.4s ease-in-out infinite',
          animationDelay: '0ms'
        }}
      />

      {/* Dot 2 */}
      <div
        className="w-2 h-2 rounded-full bg-vca-text"
        style={{
          animation: 'vca-thinking-dot 1.4s ease-in-out infinite',
          animationDelay: '200ms'
        }}
      />

      {/* Dot 3 */}
      <div
        className="w-2 h-2 rounded-full bg-vca-text"
        style={{
          animation: 'vca-thinking-dot 1.4s ease-in-out infinite',
          animationDelay: '400ms'
        }}
      />
    </div>
  );
};

