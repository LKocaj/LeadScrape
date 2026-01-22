import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>}
      <input
        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-none transition-colors"
        {...props}
      />
    </div>
  );
}
