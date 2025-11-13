import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''} ${className}`}>
      {label && <Label className="text-xs">{toSentenceCase(label)}</Label>}
      <Tabs 
        value={value} 
        onValueChange={(val) => onChange(val as T)}
      >
        <TabsList className="bg-gray-50">
        {options.map((option) => (
            <TabsTrigger
            key={option}
              value={option}
            disabled={disabled}
              className="text-xs data-[state=active]:bg-white"
          >
            {option}
            </TabsTrigger>
        ))}
        </TabsList>
      </Tabs>
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
    <div className={`flex items-center space-x-2 ${disabled ? 'opacity-50' : ''} ${className}`}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Label htmlFor={id} className="cursor-pointer text-xs">
        {toSentenceCase(label)}
      </Label>
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
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-xs">{toSentenceCase(label)}</Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-xs">{toSentenceCase(label)}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

