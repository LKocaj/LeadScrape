import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({
  label,
  options,
  placeholder = 'Select...',
  onChange,
  value,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>}
      <div className="relative">
        <select
          className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-none transition-colors appearance-none cursor-pointer pr-10"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
