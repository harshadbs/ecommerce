'use client';

import { useAuthStore } from '@/stores/auth.store';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-secondary-500">Customer Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-secondary-400" />
            <div>
              <p className="text-xs text-secondary-500">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-5 w-5 text-secondary-400" />
            <div>
              <p className="text-xs text-secondary-500">Phone</p>
              <p className="text-sm font-medium">{user.phone || 'Not added'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
