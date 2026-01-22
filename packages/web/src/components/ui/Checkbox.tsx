import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ label, checked = false, onChange, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
            checked ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-300'
          }`}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      <span className="text-sm text-navy-700">{label}</span>
    </label>
  );
}
