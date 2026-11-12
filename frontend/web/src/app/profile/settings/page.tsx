'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onProfileSubmit = async (data: any) => {
    setSavingProfile(true); setProfileMsg('');
    try {
      await api.patch('/users/me', { name: data.name, phone: data.phone || undefined });
      setProfileMsg('Profile updated!');
    } catch (err: any) {
      setProfileMsg(err.response?.data?.error || 'Failed');
    }
    setSavingProfile(false);
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) { setPasswordMsg("Passwords don't match"); return; }
    setSavingPassword(true); setPasswordMsg('');
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      setPasswordMsg('Password changed!');
      passwordForm.reset();
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.error || 'Failed');
    }
    setSavingPassword(false);
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="font-medium">Update Profile</h2>
          </div>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="label">Name</label>
              <input {...profileForm.register('name', { required: true, minLength: 2 })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...profileForm.register('phone')} className="input mt-1" placeholder="9876543210" />
            </div>
            {profileMsg && <p className={`text-sm ${profileMsg.includes('updated') ? 'text-success' : 'text-red-700'}`}>{profileMsg}</p>}
            <button type="submit" disabled={savingProfile} className="btn-primary btn-sm">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-orange-600" />
            <h2 className="font-medium">Change Password</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input {...passwordForm.register('currentPassword', { required: true })} type="password" className="input mt-1" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...passwordForm.register('newPassword', { required: true, minLength: 8 })} type="password" className="input mt-1" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...passwordForm.register('confirmPassword', { required: true })} type="password" className="input mt-1" />
            </div>
            {passwordMsg && <p className={`text-sm ${passwordMsg.includes('changed') ? 'text-success' : 'text-red-700'}`}>{passwordMsg}</p>}
            <button type="submit" disabled={savingPassword} className="btn-primary btn-sm">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
