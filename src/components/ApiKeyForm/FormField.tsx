'use client';

import { Input } from '@/components/ui/Input';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required
}: FormFieldProps) {
  return (
    <div className="mb-4" data-testid={`form-field-container-${id}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        data-testid={`form-field-${id}`}
      />
    </div>
  );
}
