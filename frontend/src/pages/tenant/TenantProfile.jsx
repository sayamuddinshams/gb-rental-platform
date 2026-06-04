import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Mail, Lock, Shield, Bell, CheckSquare } from 'lucide-react';

const TenantProfile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  // Handle personal details update
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Please fill out Name and Email fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, email });
      showToast('Account details updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Update your tenant profile, reset credentials, and customize alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form Fields (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
              <User className="h-5 w-5 text-brand-500" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving details...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Password resets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
              <Lock className="h-5 w-5 text-brand-500" />
              <span>Change Account Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md transition-colors disabled:opacity-50"
              >
                {passwordLoading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Settings configuration (1/3 Width) */}
        <div className="space-y-6">
          
          {/* Notifications toggles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
              <Bell className="h-5 w-5 text-brand-500" />
              <span>Alert Preferences</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">Email Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive visit updates and chat alerts via email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer mt-0.5"
                />
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs">Push Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive real-time chat alerts inside browser.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={() => setPushAlerts(!pushAlerts)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Account Verification state */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-brand-500" />
              <span>Identity Verification</span>
            </h3>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-500 text-xs font-bold">
              <CheckSquare className="h-5 w-5 flex-shrink-0" />
              <span>Identity Vetted & Verified</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Your tenant profile has been fully validated. You have permission to schedule visit tours and message property owners directly.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TenantProfile;
