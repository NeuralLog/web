interface ScopeCheckboxProps {
  id: string;
  scope: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function ScopeCheckbox({
  id,
  scope,
  label,
  checked,
  onChange
}: ScopeCheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        data-testid={`scope-checkbox-${id}`}
      />
      <label htmlFor={id} className="ml-2 text-sm text-gray-700 dark:text-gray-200">
        {scope} - {label}
      </label>
    </div>
  );
}
