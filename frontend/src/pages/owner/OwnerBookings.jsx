import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Mail, MessageSquare, Check, X, Clock, HelpCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const OwnerBookings = () => {
  const { showToast } = useNotification();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch owner bookings
  const fetchOwnerBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookings/owner');
      setBookings(res.data);
    } catch (err) {
      console.warn('API bookings fetch failed. Loading static owner bookings mock.');
      setBookings([
        {
          id: 1,
          property_title: 'Hunza Heights Luxury Guest Cottage',
          tenant_name: 'Ali Ahmed',
          tenant_email: 'tenant@gmail.com',
          visit_date: '2026-06-15',
          visit_time: '11:00 AM',
          notes: 'I would like to schedule a tour of the cottage. I am visiting Hunza from Lahore next week and want to verify details.',
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/api/bookings/${id}`, { status: newStatus });
      showToast(`Visit request successfully ${newStatus}!`, 'success');
      fetchOwnerBookings();
    } catch (err) {
      // Local fallback simulation
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status: newStatus } : b
      ));
      showToast(`Visit request simulated: ${newStatus}`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded w-1/4"></div>
        {[1, 2].map(s => <div key={s} className="h-44 bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tour Visit Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Approve visit timings, decline requests, and view tenant notes
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-lg">No Tour Requests</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            Tenants haven't scheduled any tours for your assets yet. All visit requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              style={{ contentVisibility: 'auto' }}
            >
              
              {/* Tour and Property details */}
              <div className="space-y-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    booking.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : booking.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {booking.status === 'pending' ? 'Pending Approval' : `Tour ${booking.status}`}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-extrabold text-md text-slate-800 dark:text-white">
                    {booking.property_title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Visit Request: <strong className="text-slate-700 dark:text-slate-200">{booking.visit_date}</strong> at <strong className="text-slate-700 dark:text-slate-200">{booking.visit_time}</strong>
                  </p>
                </div>

                {booking.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Tenant Note:</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                      {booking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Tenant info and decisions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-stretch lg:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-3xl w-full md:w-80">
                
                {/* Tenant profile details */}
                <div className="flex-1 space-y-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Visitor Profile</span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center mt-0.5">
                      <User className="h-3.5 w-3.5 text-brand-500 mr-1" />
                      <span className="truncate">{booking.tenant_name}</span>
                    </h4>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Contact Details</span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-brand-500 mr-1" />
                      <span className="truncate">{booking.tenant_email}</span>
                    </h4>
                  </div>
                </div>

                <div className="h-px sm:h-12 w-full sm:w-px bg-slate-200 dark:bg-slate-800"></div>

                {/* Actions decision */}
                <div className="flex sm:flex-col gap-2 flex-grow justify-center">
                  {booking.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        className="flex-grow py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-emerald-500/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        className="flex-grow py-2 rounded-xl border border-rose-200 dark:border-rose-950/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 font-bold text-xs flex items-center justify-center space-x-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 flex items-center justify-center space-x-1.5 text-slate-400 font-bold text-xs w-full">
                      <Clock className="h-4 w-4" />
                      <span>Closed</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OwnerBookings;
