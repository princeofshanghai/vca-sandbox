import { cn } from '@/utils/cn';

type DemoPromptChipProps = {
  text: string;
  onClick?: () => void;
};

export function DemoPromptChip({ text, onClick }: DemoPromptChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-8 max-w-[320px] rounded-[4px] bg-[rgba(140,140,140,0.1)] px-2 py-1 text-left font-sans text-[14px] font-semibold leading-[17.5px] tracking-[-0.15px] text-[rgba(0,0,0,0.9)] transition-colors',
        onClick ? 'cursor-pointer hover:bg-[rgba(140,140,140,0.16)]' : 'cursor-default'
      )}
    >
      {text}
    </button>
  );
}
