import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Building, Phone, MapPin, Shield, ShieldCheck, Check } from 'lucide-react';

const OwnerProfile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [businessName, setBusinessName] = useState(user.profile?.business_name || '');
  const [contactNumber, setContactNumber] = useState(user.profile?.contact_number || '');
  const [businessAddress, setBusinessAddress] = useState(user.profile?.business_address || '');
  const [loading, setLoading] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(user.is_verified);

  // Submit profile details
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !businessName || !contactNumber || !businessAddress) {
      showToast('Please fill out all profile fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        email,
        businessName,
        contactNumber,
        businessAddress
      });
      showToast('Landlord business profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update business details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Request verification
  const handleRequestVerification = () => {
    setVerificationRequested(true);
    showToast('Verification request submitted. Administrators will review your profile.', 'success');
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Agency Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Configure business details, verify agency accounts, and update contacts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2/3 Width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
            <Building className="h-5 w-5 text-brand-500" />
            <span>Business Information</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Contact Person Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Agency / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Karakoram Properties Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Business Hotline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., +92 345-1234567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Business Head Office Address *</label>
              <textarea
                rows={3}
                required
                placeholder="HQ building address details"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving agency settings...' : 'Save Agency Profile'}
            </button>

          </form>
        </div>

        {/* Right Column (1/3 Width) */}
        <div className="space-y-6">
          
          {/* Verification Badge card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-brand-500" />
              <span>Agency Verification</span>
            </h3>

            {user.is_verified ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-500 text-xs font-bold">
                  <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                  <span>Verified Landlord Partner</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Your agency profile is verified. All properties listed by you will automatically show the "Verified Listing" badge.
                </p>
              </div>
            ) : verificationRequested ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-3 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Verification Pending</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Verification request has been submitted. Admins are reviewing your business registrations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Listings from unverified owners are flagged to tenants. Please request a verification badge to build trust.
                </p>
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Request Verification Badge
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default OwnerProfile;
