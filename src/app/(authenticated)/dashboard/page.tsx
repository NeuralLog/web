import { DashboardController } from '@/components/dashboard/DashboardController';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      
      <DashboardController />
    </div>
  );
}
