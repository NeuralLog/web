'use client';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your NeuralLog preferences.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-gray-500 dark:text-gray-400">Toggle dark mode for the application</p>
              </div>
              <Button
                onClick={toggleTheme}
                variant="outline"
              >
                {theme === 'dark' ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <p className="text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
              </div>
              <Button
                variant="outline"
              >
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
