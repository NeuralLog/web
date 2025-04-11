'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function AuthDemoPage() {
  const [user, setUser] = useState({
    id: '123',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'admin'
  });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Auth Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of authentication and authorization features.
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Current User</h2>
          </div>
          <hr className="border-gray-200" />
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                <p>{user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p>{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p>{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p>{user.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Actions</h2>
          </div>
          <hr className="border-gray-200" />
          <div className="p-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => alert('This would log you out in a real app')}
              >
                Logout
              </Button>
              
              <Button
                variant="outline"
                onClick={() => alert('This would refresh your token in a real app')}
              >
                Refresh Token
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
