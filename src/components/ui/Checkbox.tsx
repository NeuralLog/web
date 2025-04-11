import * as React from 'react';
import { cn } from '@/utils/cn';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, ...props }, ref) => {
    const id = React.useId();
    const [checked, setChecked] = React.useState(props.checked || false);

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setChecked(props.checked);
      }
    }, [props.checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) {
        props.onChange(e);
      }
      if (props.checked === undefined) {
        setChecked(e.target.checked);
      }
    };

    return (
      <div className="flex items-start space-x-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={id}
            ref={ref}
            className="sr-only"
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border border-gray-300 flex items-center justify-center',
              checked ? 'bg-brand-500 border-brand-500' : 'bg-white',
              props.disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500',
              className
            )}
          >
            {checked && <CheckIcon className="h-3.5 w-3.5 text-white" />}
          </div>
        </div>
        {(label || description || error) && (
          <div className="space-y-1">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'text-sm font-medium text-gray-700 dark:text-gray-300',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
