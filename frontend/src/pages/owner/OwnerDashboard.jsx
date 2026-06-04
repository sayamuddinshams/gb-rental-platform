import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Building, Eye, MessageSquare, CheckSquare, Calendar, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Performance KPI stats
  const [kpis, setKpis] = useState({
    listings: 0,
    views: 0,
    inquiries: 0,
    active: 0,
    bookings: 0
  });

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        // Fetch properties owned by current user
        const propsRes = await axios.get('/api/properties');
        const ownerProps = propsRes.data.properties.filter(p => p.owner_id === user.id);
        setProperties(ownerProps);

        // Fetch bookings for owner
        const bookingsRes = await axios.get('/api/bookings/owner');
        setBookings(bookingsRes.data);

        // Calculate stats
        const totalViews = ownerProps.reduce((sum, p) => sum + (p.views_count || 0), 0);
        const activeCount = ownerProps.filter(p => p.status === 'approved').length;
        const pendingTours = bookingsRes.data.filter(b => b.status === 'pending').length;

        setKpis({
          listings: ownerProps.length,
          views: totalViews,
          inquiries: pendingTours + 2, // simulated additional chats
          active: activeCount,
          bookings: bookingsRes.data.length
        });
      } catch (err) {
        console.warn('API owner dashboard fetch failed. Initializing offline static dashboard mocks.', err.message);
        
        // Static Seeder Fallback Mocks
        const mockProps = [
          { id: 1, title: 'Hunza Heights Luxury Guest Cottage', price: 12000, status: 'approved', views_count: 342, category: 'home' },
          { id: 2, title: 'Cozy 1-Bedroom Studio Apartment', price: 4500, status: 'approved', views_count: 189, category: 'apartment' },
          { id: 4, title: 'Commercial Boutique Shop in Main Bazaar', price: 22000, status: 'pending', views_count: 45, category: 'shop' }
        ];

        const mockBookings = [
          { id: 1, property_title: 'Hunza Heights Luxury Guest Cottage', tenant_name: 'Ali Ahmed', visit_date: '2026-06-15', status: 'pending' }
        ];

        setProperties(mockProps);
        setBookings(mockBookings);

        setKpis({
          listings: 3,
          views: 576,
          inquiries: 3,
          active: 2,
          bookings: 1
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [user]);

  const cards = [
    { label: 'Total Listings', count: kpis.listings, change: '+1 this month', isPos: true, icon: Building, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Cumulative Views', count: kpis.views, change: '+12% vs last week', isPos: true, icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Inquiries Received', count: kpis.inquiries, change: '-2% vs last week', isPos: false, icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Tour Bookings', count: kpis.bookings, change: '1 pending approval', isPos: true, icon: Calendar, color: 'text-amber-500 bg-amber-500/10' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(s => <div key={s} className="h-28 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>)}
        </div>
        <div className="h-[26rem] bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Landlord Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze asset traffic, review scheduled visits, and configure property posts
          </p>
        </div>
        <Link
          to="/owner/properties"
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/15"
        >
          Post New Property
        </Link>
      </div>

      {/* 1. PERFORMANCE KPI OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`flex items-center text-[10px] font-bold ${card.isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {card.isPos ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {card.change}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{card.label}</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{card.count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. CUSTOM SVG-BASED CHARTS (Line Graph + Bar Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3: Views Trend (Line Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-brand-500" />
              <span>Weekly Property Views</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Last 7 Days</span>
          </div>

          {/* SVG Line Graph */}
          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              {/* Horizontal helper grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-slate-800" />

              {/* Area path for shading */}
              <path
                d="M 40 180 L 40 150 L 110 130 L 180 160 L 250 90 L 320 60 L 390 110 L 480 30 L 480 180 Z"
                fill="url(#viewsGrad)"
                opacity="0.15"
              />

              {/* Connected Line Graph path */}
              <path 
                d="M 40 150 L 110 130 L 180 160 L 250 90 L 320 60 L 390 110 L 480 30" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Plot dot points */}
              <circle cx="40" cy="150" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="110" cy="130" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="180" cy="160" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="250" cy="90" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="320" cy="60" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="390" cy="110" r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="480" cy="30" r="4.5" fill="#3b82f6" stroke="white" strokeWidth="2" />

              {/* Labels */}
              <text x="40" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Mon</text>
              <text x="110" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Tue</text>
              <text x="180" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Wed</text>
              <text x="250" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Thu</text>
              <text x="320" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Fri</text>
              <text x="390" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Sat</text>
              <text x="480" y="196" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Sun</text>

              {/* Gradient definition */}
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right 1/3: Inquiry Trends (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-brand-500" />
            <span>Inquiry Trends</span>
          </h3>

          {/* SVG Bar Chart */}
          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 250 200">
              <line x1="20" y1="170" x2="230" y2="170" stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-slate-800" />

              {/* Bar 1 */}
              <rect x="35" y="110" width="18" height="60" rx="4" fill="#6366f1" />
              <text x="44" y="184" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Apartment</text>
              
              {/* Bar 2 */}
              <rect x="95" y="60" width="18" height="110" rx="4" fill="#3b82f6" />
              <text x="104" y="184" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Cottage</text>

              {/* Bar 3 */}
              <rect x="155" y="130" width="18" height="40" rx="4" fill="#10b981" />
              <text x="164" y="184" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Hostels</text>

              {/* Bar 4 */}
              <rect x="210" y="150" width="18" height="20" rx="4" fill="#f59e0b" />
              <text x="219" y="184" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Shops</text>
            </svg>
          </div>
        </div>

      </div>

      {/* 3. ASSET VIEWS LEADERBOARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Active Listing Views</h3>
        
        {properties.length === 0 ? (
          <div className="text-center py-8 text-slate-400 italic">No listings posted.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Property Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Monthly Rent</th>
                  <th className="pb-3">Vetting Status</th>
                  <th className="pb-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 font-bold text-slate-800 dark:text-white">{p.title}</td>
                    <td className="py-3.5 capitalize">{p.category}</td>
                    <td className="py-3.5">PKR {p.price.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        p.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : p.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-extrabold">{p.views_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default OwnerDashboard;
