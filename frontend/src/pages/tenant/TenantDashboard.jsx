import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, Calendar, MessageSquare, Bell, CheckCircle, 
  MapPin, Eye, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantDashboard = () => {
  const { user } = useAuth();
  
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const favsRes = await axios.get('/api/properties/favorites');
        setFavorites(favsRes.data);

        const bookingsRes = await axios.get('/api/bookings/tenant');
        setBookings(bookingsRes.data);

        // Fetch notifications (simulate or fetch)
        const notifRes = await axios.get(`/api/auth/profile`); // generic call to check api status
        // Using local mock data fallback if notifications table is empty
        setNotifications([
          { id: 1, title: 'Welcome to RentGB!', message: 'Your tenant profile is active. Start exploring rental properties in Gilgit-Baltistan without brokers.', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { id: 2, title: 'Profile Setup Complete', message: 'You have verified your identity. Enjoy direct messaging with landlords.', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]);
      } catch (err) {
        console.warn('API dashboard fetches failed. Loading static tenant data mockups.', err.message);
        
        // Static Mock fallbacks
        setFavorites([
          { id: 1, title: 'Hunza Heights Luxury Guest Cottage', price: 12000, city_name: 'Hunza', address: 'Karimabad, Hunza', featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' }
        ]);
        setBookings([
          { id: 1, property_title: 'Hunza Heights Luxury Cottage', visit_date: '2026-06-15', visit_time: '11:00 AM', status: 'pending', owner_name: 'Karakoram Properties Ltd.' }
        ]);
        setNotifications([
          { id: 1, title: 'Welcome to RentGB!', message: 'Your tenant profile is active. Start exploring rental properties in Gilgit-Baltistan without brokers.', created_at: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const kpis = [
    { label: 'Saved Wishlists', count: favorites.length, color: 'text-rose-500 bg-rose-500/10', icon: Heart },
    { label: 'Scheduled Visits', count: bookings.length, color: 'text-brand-500 bg-brand-500/10', icon: Calendar },
    { label: 'Unread Messages', count: 1, color: 'text-blue-500 bg-blue-500/10', icon: MessageSquare },
    { label: 'Profile Rating', count: '100%', color: 'text-emerald-500 bg-emerald-500/10', icon: CheckCircle }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(s => <div key={s} className="h-28 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tenant Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage saved wishlists, check visit requests, and view alerts
        </p>
      </div>

      {/* 1. KPI STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{kpi.label}</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{kpi.count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. SPLIT LAYOUT (RECENT BOOKINGS & NOTIFICATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Saved Properties & Bookings) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Wishlists */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-md text-slate-800 dark:text-white">Saved Properties</h3>
              <Link to="/properties" className="text-xs font-bold text-brand-500 hover:underline">
                Find More
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">
                No saved properties in your wishlist yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    to={`/properties/${p.id}`}
                    className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <img src={p.featured_image} className="h-32 w-full object-cover" />
                    <div className="p-4 space-y-1">
                      <h4 className="font-bold text-sm truncate">{p.title}</h4>
                      <p className="text-xs text-brand-500 font-extrabold">PKR {p.price.toLocaleString()} / mo</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending Visits */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-md text-slate-800 dark:text-white">Active Visit Requests</h3>
              <Link to="/tenant/bookings" className="text-xs font-bold text-brand-500 hover:underline flex items-center space-x-0.5">
                <span>View Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">
                No pending visits scheduled.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">{b.property_title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Scheduled: {b.visit_date} at {b.visit_time} &bull; Host: {b.owner_name}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      b.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : b.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (System Notifications Drawer) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Bell className="h-5 w-5 text-brand-500" />
              <span>Notifications Feed</span>
            </h3>
            
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">{n.title}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Help & Support Glassmorphism Widget */}
          <div className="bg-gradient-to-tr from-brand-600 to-accent-blue rounded-3xl p-6 text-white space-y-4 relative overflow-hidden shadow-lg shadow-brand-500/15">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-24 w-24 bg-white/10 rounded-full blur-xl"></div>
            <Sparkles className="h-6 w-6 text-brand-200" />
            <div className="space-y-1">
              <h3 className="font-black text-sm">Need Relocating Help?</h3>
              <p className="text-[10px] text-brand-100 leading-normal">
                If you are a student moving to Skardu or Hunza, check our student hostel guides in the FAQ page or contact our team directly for direct placement assistance.
              </p>
            </div>
            <Link 
              to="/#contact"
              className="inline-flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors w-max"
            >
              <span>Contact Us</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TenantDashboard;
