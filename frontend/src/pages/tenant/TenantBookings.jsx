import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Phone, Check, Clock, AlertCircle, MapPin } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const TenantBookings = () => {
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/api/bookings/tenant');
        setBookings(res.data);
      } catch (err) {
        console.warn('API booking fetch failed. Loading static tenant bookings mockup.', err.message);
        
        // Static mock data fallback matching seeder
        setBookings([
          {
            id: 1,
            property_id: 1,
            property_title: 'Hunza Heights Luxury Guest Cottage',
            property_address: 'Zero Point Road, Karimabad, Hunza',
            visit_date: '2026-06-15',
            visit_time: '11:00 AM',
            status: 'pending',
            owner_name: 'Karakoram Properties Ltd.',
            notes: 'I would like to schedule a tour of the cottage. I am visiting Hunza from Lahore next week and want to verify details.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return {
          badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
          icon: Check,
          text: 'Approved & Scheduled'
        };
      case 'rejected':
        return {
          badge: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
          icon: AlertCircle,
          text: 'Declined'
        };
      case 'pending':
      default:
        return {
          badge: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
          icon: Clock,
          text: 'Pending Host Approval'
        };
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
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Scheduled Visits</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Track property tours, check approvals, and coordinate with owners
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-lg">No Visit Requests Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            You haven't scheduled any property tours. Find a property you like and request a visit date.
          </p>
          <Link
            to="/properties"
            className="inline-flex px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm shadow-md"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const statusConfig = getStatusStyle(booking.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6"
                style={{ contentVisibility: 'auto' }}
              >
                
                {/* Left Side: Property and Schedule details */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.badge}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusConfig.text}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Link 
                      to={`/properties/${booking.property_id}`}
                      className="font-extrabold text-lg text-slate-800 dark:text-white hover:text-brand-500 transition-colors"
                    >
                      {booking.property_title}
                    </Link>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span>{booking.property_address}</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-[9px] uppercase font-bold text-slate-400">My Note:</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Host and Visit Date details */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-stretch lg:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-3xl w-full md:w-80">
                  
                  {/* Tour details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Tour Date</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                        {booking.visit_date}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Tour Time</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                        {booking.visit_time}
                      </p>
                    </div>
                  </div>

                  <div className="h-px sm:h-12 w-full sm:w-px bg-slate-200 dark:bg-slate-800"></div>

                  {/* Host details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Owner / Host</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                        <User className="h-3.5 w-3.5 text-brand-500 mr-1 flex-shrink-0" />
                        <span className="truncate">{booking.owner_name}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Contact Details</span>
                      {booking.status === 'approved' ? (
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                          <Phone className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" />
                          <span>+92 345-1234567</span>
                        </p>
                      ) : (
                        <p 
                          onClick={() => showToast('Contact information is shown once the host approves your request', 'info')}
                          className="text-[10px] font-bold text-slate-400 flex items-center cursor-pointer mt-0.5 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 text-slate-300 mr-1 flex-shrink-0" />
                          <span>Available on Approval</span>
                        </p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default TenantBookings;
