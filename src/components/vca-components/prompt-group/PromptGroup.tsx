import { Prompt } from '../prompt';
import { cn } from '@/utils';

export type PromptGroupProps = {
  prompts?: Array<{
    text: string;
    showAiIcon?: boolean;
    onClick?: () => void;
  }>;
  className?: string;
};

/**
 * PromptGroup - Vertical list of prompt suggestions
 * Displays multiple clickable prompt chips in a stack
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const PromptGroup = ({
  prompts = [
    { text: 'This is a prompt', showAiIcon: false },
    { text: 'This is a prompt', showAiIcon: false },
    { text: 'This is a prompt', showAiIcon: false },
  ],
  className,
}: PromptGroupProps) => {

  return (
    <div className={cn('flex flex-col gap-vca-s items-start', className)}>
      {prompts.map((prompt, index) => (
        <Prompt
          key={index}
          showAiIcon={prompt.showAiIcon}
          onClick={prompt.onClick}
        >
          {prompt.text}
        </Prompt>
      ))}
    </div>
  );
};

