'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import ErrorMessage from '../common/ErrorMessage';
import FormField from './FormField';
import ScopeCheckbox from './ScopeCheckbox';

interface ApiKeyFormProps {
  onSubmit: (name: string, scopes: string[]) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function ApiKeyForm({ onSubmit, isSubmitting, error }: ApiKeyFormProps) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(['logs:write', 'logs:read']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, scopes);
    setName('');
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter(s => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="api-key-form" className="w-full">
      <div className="flex flex-col space-y-4">
        {error && <ErrorMessage message={error} />}

        <FormField
          id="api-key-name"
          label="Name"
          value={name}
          onChange={setName}
          placeholder="e.g., Production MCP Client"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Permissions
          </label>
          <div className="flex flex-col space-y-2">
            <ScopeCheckbox
              id="logs-write"
              scope="logs:write"
              label="Write logs to the server"
              checked={scopes.includes("logs:write")}
              onChange={() => toggleScope("logs:write")}
            />

            <ScopeCheckbox
              id="logs-read"
              scope="logs:read"
              label="Read logs from the server"
              checked={scopes.includes("logs:read")}
              onChange={() => toggleScope("logs:read")}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || !name.trim()}
          data-testid="submit-button"
        >
          {isSubmitting ? "Creating..." : "Create API Key"}
        </Button>
      </div>
    </form>
  );
}
