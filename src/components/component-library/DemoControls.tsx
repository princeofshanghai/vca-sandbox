import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Reusable Demo Control Components
 * Used in Demo sections across component pages for consistent styling
 */

// ============================================================
// Helper function to convert to sentence case
// ============================================================
const toSentenceCase = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ============================================================
// Toggle Tabs - For selecting between options using shadcn Tabs
// ============================================================
type ToggleButtonsProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
};

export function ToggleButtons<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: ToggleButtonsProps<T>) {
  const useSelect = options.length > 3;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50' : ''} ${className}`}>
      {label && <Label className="text-xs text-shell-muted">{toSentenceCase(label)}</Label>}
      {useSelect ? (
        <Select value={value} onValueChange={(val) => onChange(val as T)} disabled={disabled}>
          <SelectTrigger className="h-8 border-shell-border bg-shell-bg px-2.5 text-xs text-shell-text data-[placeholder]:text-shell-muted focus:ring-shell-accent/30 focus:border-shell-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-shell-border bg-shell-bg text-shell-text">
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="text-xs focus:bg-shell-surface-subtle focus:text-shell-text"
              >
                {toSentenceCase(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Tabs
          value={value}
          onValueChange={(val) => onChange(val as T)}
        >
          <TabsList className="h-8 rounded-md border border-shell-border bg-shell-border/60 p-0.5">
            {options.map((option) => (
              <TabsTrigger
                key={option}
                value={option}
                disabled={disabled}
                className="h-6 rounded-[6px] border border-transparent px-2.5 text-xs font-medium text-shell-muted transition-all data-[state=active]:border-shell-border data-[state=active]:bg-shell-bg data-[state=active]:text-shell-text data-[state=active]:shadow-sm"
              >
                {toSentenceCase(option)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}

// ============================================================
// Form Checkbox - Checkbox with label
// ============================================================
type FormCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function FormCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: FormCheckboxProps) {
  return (
    <div className={`flex items-center justify-between rounded-md border border-shell-border bg-shell-bg px-3 py-2 ${disabled ? 'opacity-50' : ''} ${className}`}>
      <Label htmlFor={id} className="cursor-pointer text-xs text-shell-text">
        {toSentenceCase(label)}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size="sm"
      />
    </div>
  );
}

// ============================================================
// Form Input - Text input with label
// ============================================================
type FormInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

export function FormInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: FormInputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs text-shell-muted">{toSentenceCase(label)}</Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-8 border-shell-border bg-shell-bg px-2.5 text-sm text-shell-text placeholder:text-shell-muted focus-visible:ring-shell-accent/30 focus-visible:border-shell-accent"
      />
    </div>
  );
}

// ============================================================
// Form Textarea - Textarea with label
// ============================================================
type FormTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
  className = '',
}: FormTextareaProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs text-shell-muted">{toSentenceCase(label)}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[56px] border-shell-border bg-shell-bg px-2.5 py-1.5 text-sm text-shell-text placeholder:text-shell-muted focus-visible:ring-shell-accent/30 focus-visible:border-shell-accent"
      />
    </div>
  );
}
