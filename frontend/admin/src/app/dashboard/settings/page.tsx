'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Check } from 'lucide-react';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    // Load current user data
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      profileForm.reset({ name: user.name, phone: user.phone || '' });
    }
  }, []);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileError('');
    setProfileSuccess(false);
    setIsLoadingProfile(true);
    try {
      const res = await api.patch('/users/me', {
        name: data.name,
        phone: data.phone || undefined,
      });
      const updatedUser = res.data.data.user;
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError('');
    setPasswordSuccess(false);
    setIsLoadingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your admin account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Profile</h2>
              <p className="text-xs text-gray-500">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input {...profileForm.register('name')} className="input mt-1" />
              {profileForm.formState.errors.name && <p className="text-red-600 text-xs mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...profileForm.register('phone')} className="input mt-1" placeholder="9876543210" />
              {profileForm.formState.errors.phone && <p className="text-red-600 text-xs mt-1">{profileForm.formState.errors.phone.message}</p>}
            </div>

            {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
            {profileSuccess && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check className="h-4 w-4" /> Profile updated successfully
              </p>
            )}

            <button type="submit" className="btn-primary btn-md" disabled={isLoadingProfile}>
              {isLoadingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Lock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...passwordForm.register('currentPassword')} type="password" className="input mt-1" />
              {passwordForm.formState.errors.currentPassword && <p className="text-red-600 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...passwordForm.register('newPassword')} type="password" className="input mt-1" />
              {passwordForm.formState.errors.newPassword && <p className="text-red-600 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...passwordForm.register('confirmPassword')} type="password" className="input mt-1" />
              {passwordForm.formState.errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>

            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check className="h-4 w-4" /> Password changed successfully
              </p>
            )}

            <button type="submit" className="btn-primary btn-md" disabled={isLoadingPassword}>
              {isLoadingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
